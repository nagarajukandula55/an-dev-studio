# AN Dev Studio — System Architecture (v1)

## 1. High Level Design

AN Dev Studio is composed of 5 core layers:

### 1. UI Layer
- Web dashboard (Next.js)
- Project workspace
- AI interaction panel

---

### 2. Orchestration Layer
- Multi-agent controller
- Task decomposition engine
- Execution planner

---

### 3. Intelligence Layer
- Code understanding engine
- Repository analysis system
- Semantic search engine

---

### 4. Tool Layer
- Git operations
- File system operations
- Build/test execution
- External integrations

---

### 5. Memory Layer
- Vector database
- Project knowledge graph
- Decision history (ADRs)
- User + system memory

---

## 2. Multi-Agent System

Agents:

- Architect Agent
- Planner Agent
- Backend Agent
- Frontend Agent
- QA Agent
- DevOps Agent
- Reviewer Agent

Each agent has:
- Role definition
- Tool access rules
- Memory access rules

---

## 3. Execution Flow

1. User Request
2. Planner breaks task into steps
3. Architect validates structure
4. Agents execute tasks
5. Reviewer validates output
6. Git commits changes

---

## 4. Core Design Philosophy

> AI must behave like an engineering organization, not a chatbot.