"""
============================================================================
ANu Fine-Tuning Script
Trains a custom LoRA adapter on AN Dev Studio domain data using Unsloth.

Requirements:
  pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
  pip install --no-deps trl peft accelerate bitsandbytes

Usage:
  python anu/train/finetune.py

Output:
  anu/train/anu-adapter/  — LoRA adapter weights
  anu/train/anu-gguf/     — GGUF file for Ollama

After training, update the Modelfile:
  FROM ./anu/train/anu-gguf/anu-q4_k_m.gguf
  Then: ollama create anu -f ./anu/Modelfile
============================================================================
"""

import json
import os
from pathlib import Path

# ── Config ───────────────────────────────────────────────────────────────────

BASE_MODEL      = "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit"
MAX_SEQ_LENGTH  = 4096
TRAINING_DATA   = Path(__file__).parent / "training_data.jsonl"
OUTPUT_ADAPTER  = Path(__file__).parent / "anu-adapter"
OUTPUT_GGUF     = Path(__file__).parent / "anu-gguf"
EPOCHS          = 3
BATCH_SIZE      = 2
GRAD_ACCUM      = 4
LEARNING_RATE   = 2e-4
LORA_R          = 16
LORA_ALPHA      = 16

# ── Load model ───────────────────────────────────────────────────────────────

def main():
    try:
        from unsloth import FastLanguageModel
        import torch
        from trl import SFTTrainer
        from transformers import TrainingArguments
        from datasets import Dataset
    except ImportError:
        print("❌ Missing dependencies. Run:")
        print('   pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"')
        print("   pip install --no-deps trl peft accelerate bitsandbytes datasets")
        return

    print("╔═══════════════════════════════════════╗")
    print("║  ANu Fine-Tuning — AN Dev Studio      ║")
    print("╚═══════════════════════════════════════╝")
    print()

    # Load base model with 4-bit quantization (fits in 6GB VRAM)
    print(f"► Loading base model: {BASE_MODEL}")
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name      = BASE_MODEL,
        max_seq_length  = MAX_SEQ_LENGTH,
        dtype           = None,  # Auto-detect
        load_in_4bit    = True,
    )

    # Add LoRA adapters
    print("► Applying LoRA adapters...")
    model = FastLanguageModel.get_peft_model(
        model,
        r                   = LORA_R,
        target_modules      = ["q_proj", "k_proj", "v_proj", "o_proj",
                                "gate_proj", "up_proj", "down_proj"],
        lora_alpha          = LORA_ALPHA,
        lora_dropout        = 0,
        bias                = "none",
        use_gradient_checkpointing = "unsloth",
        random_state        = 42,
        use_rslora          = False,
    )

    # Load training data
    print(f"► Loading training data from {TRAINING_DATA}")
    if not TRAINING_DATA.exists():
        print("  ⚠ training_data.jsonl not found — generating sample data...")
        generate_sample_data(TRAINING_DATA)

    examples = []
    with open(TRAINING_DATA) as f:
        for line in f:
            line = line.strip()
            if line:
                data = json.loads(line)
                # Format as chat template
                text = format_chat(data["messages"], tokenizer)
                examples.append({"text": text})

    dataset = Dataset.from_list(examples)
    print(f"  ✓ {len(examples)} training examples loaded")

    # Training
    print(f"► Starting training ({EPOCHS} epochs)...")
    trainer = SFTTrainer(
        model           = model,
        tokenizer       = tokenizer,
        train_dataset   = dataset,
        dataset_text_field = "text",
        max_seq_length  = MAX_SEQ_LENGTH,
        args = TrainingArguments(
            per_device_train_batch_size     = BATCH_SIZE,
            gradient_accumulation_steps     = GRAD_ACCUM,
            warmup_steps                    = 10,
            num_train_epochs                = EPOCHS,
            learning_rate                   = LEARNING_RATE,
            fp16                            = not torch.cuda.is_bf16_supported(),
            bf16                            = torch.cuda.is_bf16_supported(),
            logging_steps                   = 10,
            optim                           = "adamw_8bit",
            weight_decay                    = 0.01,
            lr_scheduler_type               = "linear",
            output_dir                      = str(OUTPUT_ADAPTER),
            save_strategy                   = "epoch",
        ),
    )

    trainer.train()
    print("  ✓ Training complete")

    # Save adapter
    print(f"► Saving LoRA adapter to {OUTPUT_ADAPTER}...")
    OUTPUT_ADAPTER.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(str(OUTPUT_ADAPTER))
    tokenizer.save_pretrained(str(OUTPUT_ADAPTER))

    # Export to GGUF for Ollama
    print(f"► Exporting to GGUF format for Ollama...")
    OUTPUT_GGUF.mkdir(parents=True, exist_ok=True)
    model.save_pretrained_gguf(
        str(OUTPUT_GGUF / "anu"),
        tokenizer,
        quantization_method = "q4_k_m",  # Good balance of size and quality
    )

    print()
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║  ANu fine-tuning complete!                                ║")
    print("║                                                           ║")
    print("║  Next: update anu/Modelfile to use your fine-tuned model: ║")
    print("║    FROM ./anu/train/anu-gguf/anu-q4_k_m.gguf              ║")
    print("║  Then rebuild: ollama create anu -f ./anu/Modelfile        ║")
    print("╚═══════════════════════════════════════════════════════════╝")


def format_chat(messages: list, tokenizer) -> str:
    """Format messages into the model's expected chat template."""
    if hasattr(tokenizer, "apply_chat_template"):
        return tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
    # Fallback: manual format
    result = ""
    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        result += f"<|im_start|>{role}\n{content}<|im_end|>\n"
    return result + "<|im_start|>assistant\n"


def generate_sample_data(path: Path):
    """Generate sample training data for ANu."""
    samples = [
        {
            "messages": [
                {"role": "system",    "content": "You are ANu, the AI assistant for AN Dev Studio."},
                {"role": "user",      "content": "Create a TypeScript function to validate an email address"},
                {"role": "assistant", "content": "### src/utils/validation.ts\n\n```typescript\n/**\n * Validates an email address using RFC 5322 pattern.\n * Returns true if valid, false otherwise.\n */\nexport function isValidEmail(email: string): boolean {\n  if (!email || typeof email !== 'string') return false;\n  const pattern = /^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$/;\n  return pattern.test(email.trim());\n}\n\n/**\n * Validates email and returns a descriptive error or null.\n */\nexport function validateEmail(email: string): string | null {\n  if (!email) return 'Email is required';\n  if (!isValidEmail(email)) return 'Invalid email format';\n  return null;\n}\n```"},
            ]
        },
        {
            "messages": [
                {"role": "system",    "content": "You are ANu, the AI assistant for AN Dev Studio. You are acting as ArchitectAgent."},
                {"role": "user",      "content": "Design a REST API for a project management system"},
                {"role": "assistant", "content": "## Project Management API — Architecture\n\n### Endpoints\n\n```\nPOST   /api/v1/projects          Create project\nGET    /api/v1/projects          List projects\nGET    /api/v1/projects/:id      Get project\nPATCH  /api/v1/projects/:id      Update project\nDELETE /api/v1/projects/:id      Delete project\n\nPOST   /api/v1/projects/:id/tasks    Create task\nGET    /api/v1/projects/:id/tasks    List tasks\nPATCH  /api/v1/tasks/:id             Update task\nDELETE /api/v1/tasks/:id             Delete task\n```\n\n### Data Models\n\n```typescript\ninterface Project {\n  id: string;\n  name: string;\n  description: string;\n  status: 'active' | 'paused' | 'archived';\n  ownerId: string;\n  createdAt: Date;\n  updatedAt: Date;\n}\n\ninterface Task {\n  id: string;\n  projectId: string;\n  title: string;\n  status: 'todo' | 'in_progress' | 'done';\n  priority: 'low' | 'medium' | 'high';\n  assigneeId?: string;\n  dueDate?: Date;\n}\n```\n\n### Key Decisions\n- REST over GraphQL for simplicity\n- UUID primary keys for security\n- Soft deletes via `archivedAt` timestamp\n- Pagination via cursor (not offset) for scalability"},
            ]
        },
        {
            "messages": [
                {"role": "system",    "content": "You are ANu, the AI assistant for AN Dev Studio. You are acting as QAAgent."},
                {"role": "user",      "content": "Write Vitest tests for the isValidEmail function"},
                {"role": "assistant", "content": "### src/utils/__tests__/validation.test.ts\n\n```typescript\nimport { describe, it, expect } from 'vitest';\nimport { isValidEmail, validateEmail } from '../validation';\n\ndescribe('isValidEmail', () => {\n  it('accepts valid emails', () => {\n    expect(isValidEmail('user@example.com')).toBe(true);\n    expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);\n    expect(isValidEmail('123@domain.org')).toBe(true);\n  });\n\n  it('rejects invalid emails', () => {\n    expect(isValidEmail('notanemail')).toBe(false);\n    expect(isValidEmail('@domain.com')).toBe(false);\n    expect(isValidEmail('user@')).toBe(false);\n    expect(isValidEmail('user @domain.com')).toBe(false);\n  });\n\n  it('handles edge cases', () => {\n    expect(isValidEmail('')).toBe(false);\n    expect(isValidEmail(null as unknown as string)).toBe(false);\n    expect(isValidEmail('  user@domain.com  ')).toBe(true); // trims whitespace\n  });\n});\n\ndescribe('validateEmail', () => {\n  it('returns null for valid email', () => {\n    expect(validateEmail('user@example.com')).toBeNull();\n  });\n\n  it('returns error message for empty email', () => {\n    expect(validateEmail('')).toBe('Email is required');\n  });\n\n  it('returns error message for invalid format', () => {\n    expect(validateEmail('notvalid')).toBe('Invalid email format');\n  });\n});\n```"},
            ]
        },
    ]

    with open(path, "w") as f:
        for sample in samples:
            f.write(json.dumps(sample) + "\n")

    print(f"  ✓ Generated {len(samples)} sample training examples at {path}")
    print("  ℹ Add your own examples to this file for better fine-tuning")


if __name__ == "__main__":
    main()
