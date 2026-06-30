"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Project {
  id: string;
  name: string;
  color: string;
}

interface FileNode {
  name: string;
  type: "file" | "folder";
  language?: string;
  children?: FileNode[];
  content?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIMULATED_FILE_TREE: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "app",
        type: "folder",
        children: [
          {
            name: "page.tsx",
            type: "file",
            language: "tsx",
            content: `"use client";\n\nimport React from "react";\n\nexport default function Page() {\n  return (\n    <main>\n      <h1>Hello, World!</h1>\n    </main>\n  );\n}\n`,
          },
          {
            name: "layout.tsx",
            type: "file",
            language: "tsx",
            content: `import type { Metadata } from "next";\n\nexport const metadata: Metadata = {\n  title: "My App",\n  description: "Built with Next.js",\n};\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode;\n}) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n`,
          },
          {
            name: "globals.css",
            type: "file",
            language: "css",
            content: `* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n:root {\n  --background: #ffffff;\n  --foreground: #0f172a;\n  --border: #e2e8f0;\n  --muted: #64748b;\n  --surface: #f8fafc;\n}\n\nbody {\n  font-family: system-ui, sans-serif;\n  background: var(--background);\n  color: var(--foreground);\n}\n`,
          },
        ],
      },
      {
        name: "components",
        type: "folder",
        children: [
          {
            name: "Button.tsx",
            type: "file",
            language: "tsx",
            content: `import React from "react";\n\ninterface ButtonProps {\n  label: string;\n  onClick?: () => void;\n  variant?: "primary" | "secondary";\n  disabled?: boolean;\n}\n\nexport default function Button({\n  label,\n  onClick,\n  variant = "primary",\n  disabled = false,\n}: ButtonProps) {\n  return (\n    <button\n      onClick={onClick}\n      disabled={disabled}\n      style={{\n        padding: "8px 16px",\n        borderRadius: 8,\n        border: variant === "secondary" ? "1px solid #e2e8f0" : "none",\n        background: variant === "primary" ? "#6366f1" : "transparent",\n        color: variant === "primary" ? "#fff" : "#0f172a",\n        cursor: disabled ? "not-allowed" : "pointer",\n        opacity: disabled ? 0.5 : 1,\n      }}\n    >\n      {label}\n    </button>\n  );\n}\n`,
          },
          {
            name: "Card.tsx",
            type: "file",
            language: "tsx",
            content: `import React from "react";\n\ninterface CardProps {\n  title: string;\n  children: React.ReactNode;\n}\n\nexport default function Card({ title, children }: CardProps) {\n  return (\n    <div\n      style={{\n        background: "#fff",\n        border: "1px solid #e2e8f0",\n        borderRadius: 12,\n        padding: 20,\n        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",\n      }}\n    >\n      <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 700 }}>\n        {title}\n      </h3>\n      {children}\n    </div>\n  );\n}\n`,
          },
        ],
      },
      {
        name: "lib",
        type: "folder",
        children: [
          {
            name: "utils.ts",
            type: "file",
            language: "ts",
            content: `export function cn(...classes: (string | undefined | null | false)[]): string {\n  return classes.filter(Boolean).join(" ");\n}\n\nexport function formatDate(iso: string): string {\n  return new Date(iso).toLocaleDateString(undefined, {\n    month: "short",\n    day: "numeric",\n    year: "numeric",\n  });\n}\n\nexport function slugify(text: string): string {\n  return text\n    .toLowerCase()\n    .replace(/[^\\w\\s-]/g, "")\n    .replace(/[\\s_-]+/g, "-")\n    .replace(/^-+|-+$/g, "");\n}\n`,
          },
          {
            name: "api.ts",
            type: "file",
            language: "ts",
            content: `const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";\n\nexport async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {\n  const res = await fetch(\`\${BASE_URL}\${path}\`, {\n    headers: { "Content-Type": "application/json" },\n    ...init,\n  });\n  if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);\n  return res.json() as Promise<T>;\n}\n`,
          },
        ],
      },
    ],
  },
  {
    name: "public",
    type: "folder",
    children: [
      {
        name: "favicon.ico",
        type: "file",
        language: "ico",
        content: `// Binary file — favicon.ico\n// This file is served as a static asset.\n`,
      },
      {
        name: "og-image.png",
        type: "file",
        language: "png",
        content: `// Binary file — og-image.png\n// Open Graph social preview image.\n`,
      },
    ],
  },
  {
    name: "package.json",
    type: "file",
    language: "json",
    content: `{\n  "name": "my-app",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start",\n    "lint": "next lint"\n  },\n  "dependencies": {\n    "next": "14.2.0",\n    "react": "^18",\n    "react-dom": "^18"\n  },\n  "devDependencies": {\n    "@types/node": "^20",\n    "@types/react": "^18",\n    "typescript": "^5"\n  }\n}\n`,
  },
  {
    name: "tsconfig.json",
    type: "file",
    language: "json",
    content: `{\n  "compilerOptions": {\n    "target": "ES2017",\n    "lib": ["dom", "dom.iterable", "esnext"],\n    "allowJs": true,\n    "skipLibCheck": true,\n    "strict": true,\n    "noEmit": true,\n    "esModuleInterop": true,\n    "module": "esnext",\n    "moduleResolution": "bundler",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "jsx": "preserve",\n    "incremental": true,\n    "plugins": [{ "name": "next" }],\n    "paths": { "@/*": ["./src/*"] }\n  },\n  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],\n  "exclude": ["node_modules"]\n}\n`,
  },
  {
    name: ".env.local",
    type: "file",
    language: "env",
    content: `# Environment variables\n# Do NOT commit this file to version control\n\nNEXT_PUBLIC_API_URL=http://localhost:3000\nDATABASE_URL=postgresql://user:password@localhost:5432/mydb\n`,
  },
  {
    name: "README.md",
    type: "file",
    language: "md",
    content: `# My App\n\nA Next.js application built with TypeScript.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nOpen [http://localhost:3000](http://localhost:3000) to view it in your browser.\n\n## Tech Stack\n\n- Next.js 14\n- React 18\n- TypeScript 5\n`,
  },
];

const LANGUAGE_COLORS: Record<string, string> = {
  tsx: "#3178c6",
  ts: "#3178c6",
  js: "#f7df1e",
  jsx: "#61dafb",
  css: "#264de4",
  json: "#000000",
  md: "#083fa1",
  env: "#4caf50",
  ico: "#94a3b8",
  png: "#94a3b8",
};

const LANGUAGE_LABELS: Record<string, string> = {
  tsx: "TSX",
  ts: "TypeScript",
  js: "JavaScript",
  jsx: "JSX",
  css: "CSS",
  json: "JSON",
  md: "Markdown",
  env: "Env",
  ico: "Binary",
  png: "Binary",
};

// ---------------------------------------------------------------------------
// InfoBanner
// ---------------------------------------------------------------------------

function InfoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 16px",
        borderRadius: 10,
        background: "linear-gradient(90deg, #eef2ff 0%, #f5f3ff 100%)",
        border: "1px solid #c7d2fe",
        fontSize: 13,
        color: "#3730a3",
        fontWeight: 500,
        flexWrap: "wrap",
      }}
    >
      <span>
        💡 This workspace connects to your local filesystem. For full IDE
        capabilities, use the{" "}
        <strong>ANu CLI</strong> or{" "}
        <strong>VS Code extension</strong>{" "}
        (coming soon).
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#6366f1",
          fontSize: 18,
          lineHeight: 1,
          padding: "0 2px",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// File tree helpers
// ---------------------------------------------------------------------------

function getFileIcon(node: FileNode): string {
  if (node.type === "folder") return "📁";
  const ext = node.language ?? "";
  const icons: Record<string, string> = {
    tsx: "⚛",
    ts: "𝚃",
    js: "𝙹",
    jsx: "⚛",
    css: "🎨",
    json: "{}",
    md: "📄",
    env: "🔒",
    ico: "🖼",
    png: "🖼",
  };
  return icons[ext] ?? "📄";
}

// Flatten tree to get path-based file lookup
function flattenTree(
  nodes: FileNode[],
  prefix = ""
): { path: string; node: FileNode }[] {
  const result: { path: string; node: FileNode }[] = [];
  for (const node of nodes) {
    const path = prefix ? `${prefix}/${node.name}` : node.name;
    result.push({ path, node });
    if (node.type === "folder" && node.children) {
      result.push(...flattenTree(node.children, path));
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// TreeNode component
// ---------------------------------------------------------------------------

interface TreeNodeProps {
  node: FileNode;
  path: string;
  depth: number;
  selectedPath: string;
  onSelect: (path: string, node: FileNode) => void;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
}

function TreeNode({
  node,
  path,
  depth,
  selectedPath,
  onSelect,
  expandedPaths,
  onToggle,
}: TreeNodeProps) {
  const isExpanded = expandedPaths.has(path);
  const isSelected = selectedPath === path;
  const isFolder = node.type === "folder";

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) {
            onToggle(path);
          } else {
            onSelect(path, node);
          }
        }}
        title={node.name}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          paddingLeft: 8 + depth * 14,
          paddingRight: 8,
          paddingTop: 4,
          paddingBottom: 4,
          background: isSelected
            ? "linear-gradient(90deg, #6366f120, #8b5cf615)"
            : "transparent",
          border: "none",
          borderLeft: isSelected ? "2px solid #6366f1" : "2px solid transparent",
          borderRadius: isSelected ? "0 6px 6px 0" : 0,
          cursor: "pointer",
          textAlign: "left",
          color: isSelected
            ? "var(--foreground, #0f172a)"
            : "var(--foreground, #374151)",
          fontSize: 12.5,
          fontWeight: isSelected ? 600 : 400,
          transition: "background 0.1s, border-color 0.1s",
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = "var(--border, #e2e8f0)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        {isFolder && (
          <span
            aria-hidden="true"
            style={{
              fontSize: 9,
              color: "#94a3b8",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
              flexShrink: 0,
              display: "inline-block",
            }}
          >
            ▶
          </span>
        )}
        <span
          aria-hidden="true"
          style={{ fontSize: 12, flexShrink: 0, minWidth: 16, textAlign: "center" }}
        >
          {isFolder ? (isExpanded ? "📂" : "📁") : getFileIcon(node)}
        </span>
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {node.name}
        </span>
      </button>

      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.name}
              node={child}
              path={`${path}/${child.name}`}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LeftPanel
// ---------------------------------------------------------------------------

interface LeftPanelProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  selectedFilePath: string;
  onSelectFile: (path: string, node: FileNode) => void;
  expandedPaths: Set<string>;
  onTogglePath: (path: string) => void;
}

function LeftPanel({
  projects,
  selectedProjectId,
  onSelectProject,
  selectedFilePath,
  onSelectFile,
  expandedPaths,
  onTogglePath,
}: LeftPanelProps) {
  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        background: "var(--surface, #f8fafc)",
        border: "1px solid var(--border, #e2e8f0)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "calc(100vh - 180px)",
        position: "sticky",
        top: 72,
      }}
    >
      {/* Project selector */}
      <div
        style={{
          padding: "12px 12px 8px",
          borderBottom: "1px solid var(--border, #e2e8f0)",
          flexShrink: 0,
        }}
      >
        <label
          htmlFor="project-select"
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--muted, #64748b)",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 6,
          }}
        >
          Project
        </label>
        <select
          id="project-select"
          value={selectedProjectId}
          onChange={(e) => onSelectProject(e.target.value)}
          style={{
            width: "100%",
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid var(--border, #e2e8f0)",
            background: "var(--background, #ffffff)",
            color: "var(--foreground, #0f172a)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            outline: "none",
            boxSizing: "border-box",
          }}
        >
          {projects.length === 0 ? (
            <option value="">No projects found</option>
          ) : (
            projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* File tree header */}
      <div
        style={{
          padding: "10px 12px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--muted, #64748b)",
            textTransform: "uppercase",
          }}
        >
          Explorer
        </span>
        <span
          style={{
            fontSize: 10,
            color: "var(--muted, #94a3b8)",
            fontStyle: "italic",
          }}
        >
          simulated
        </span>
      </div>

      {/* Tree */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 0 12px",
        }}
      >
        {SIMULATED_FILE_TREE.map((node) => (
          <TreeNode
            key={node.name}
            node={node}
            path={node.name}
            depth={0}
            selectedPath={selectedFilePath}
            onSelect={onSelectFile}
            expandedPaths={expandedPaths}
            onToggle={onTogglePath}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CodeEditor toolbar buttons
// ---------------------------------------------------------------------------

interface ToolbarButtonProps {
  label: string;
  onClick: () => void;
  accent?: boolean;
  icon?: React.ReactNode;
}

function ToolbarButton({ label, onClick, accent = false, icon }: ToolbarButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 12px",
        borderRadius: 7,
        border: accent ? "none" : "1px solid var(--border, #e2e8f0)",
        background: accent
          ? hovered
            ? "#4f46e5"
            : "#6366f1"
          : hovered
          ? "var(--border, #e2e8f0)"
          : "var(--surface, #f8fafc)",
        color: accent ? "#ffffff" : "var(--foreground, #374151)",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.15s",
        textDecoration: "none",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// RightPanel — code editor area
// ---------------------------------------------------------------------------

interface RightPanelProps {
  selectedFilePath: string;
  selectedFileNode: FileNode | null;
  code: string;
  onCodeChange: (v: string) => void;
}

function RightPanel({
  selectedFilePath,
  selectedFileNode,
  code,
  onCodeChange,
}: RightPanelProps) {
  const [saved, setSaved] = useState(false);
  const [formatted, setFormatted] = useState(false);
  const [copied, setCopied] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lang = selectedFileNode?.language ?? "txt";
  const langLabel = LANGUAGE_LABELS[lang] ?? lang.toUpperCase();
  const langColor = LANGUAGE_COLORS[lang] ?? "#94a3b8";

  const filename = selectedFilePath
    ? selectedFilePath.split("/").pop() ?? selectedFilePath
    : "No file selected";

  const handleSave = () => {
    setSaved(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setSaved(false), 2000);
  };

  const handleFormat = () => {
    // Simulated format: normalize line endings and trim trailing spaces
    const formatted_code = code
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    onCodeChange(formatted_code);
    setFormatted(true);
    if (formatTimerRef.current) clearTimeout(formatTimerRef.current);
    formatTimerRef.current = setTimeout(() => setFormatted(false), 2000);
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (formatTimerRef.current) clearTimeout(formatTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface, #ffffff)",
        border: "1px solid var(--border, #e2e8f0)",
        borderRadius: 12,
        overflow: "hidden",
        height: "calc(100vh - 180px)",
        position: "sticky",
        top: 72,
      }}
    >
      {/* File header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border, #e2e8f0)",
          background: "var(--background, #f8fafc)",
          flexShrink: 0,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {/* Left: filename + lang badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--foreground, #0f172a)",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}
          >
            {filename}
          </span>
          {selectedFileNode && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 999,
                background: langColor + "18",
                color: langColor === "#f7df1e" ? "#92400e" : langColor,
                border: `1px solid ${langColor}33`,
                letterSpacing: "0.04em",
              }}
            >
              {langLabel}
            </span>
          )}
          {selectedFilePath && (
            <span
              style={{
                fontSize: 11,
                color: "var(--muted, #94a3b8)",
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              {selectedFilePath}
            </span>
          )}
        </div>

        {/* Right: copy button */}
        <button
          onClick={handleCopy}
          title="Copy to clipboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid var(--border, #e2e8f0)",
            background: "transparent",
            cursor: "pointer",
            fontSize: 12,
            color: copied ? "#10b981" : "var(--muted, #64748b)",
            fontWeight: 600,
            transition: "color 0.2s",
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          borderBottom: "1px solid var(--border, #e2e8f0)",
          background: "var(--background, #f8fafc)",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <ToolbarButton
          label={saved ? "Saved!" : "Save"}
          onClick={handleSave}
          accent={saved}
          icon={
            saved ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            )
          }
        />
        <ToolbarButton
          label={formatted ? "Formatted!" : "Format"}
          onClick={handleFormat}
          accent={formatted}
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="21" y1="10" x2="7" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="7" y2="18" />
            </svg>
          }
        />
        <div
          style={{
            width: 1,
            height: 20,
            background: "var(--border, #e2e8f0)",
            flexShrink: 0,
          }}
        />
        <Link
          href="/ai?agent=reviewer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 12px",
            borderRadius: 7,
            border: "1px solid #c7d2fe",
            background: "#eef2ff",
            color: "#4f46e5",
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e0e7ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#eef2ff";
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          AI Review
        </Link>

        {/* line/char count */}
        {selectedFileNode && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: "var(--muted, #94a3b8)",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}
          >
            {code.split("\n").length} lines · {code.length} chars
          </span>
        )}
      </div>

      {/* Editor area */}
      {selectedFileNode ? (
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          spellCheck={false}
          aria-label={`Code editor for ${filename}`}
          style={{
            flex: 1,
            resize: "none",
            border: "none",
            outline: "none",
            padding: "16px 20px",
            fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', monospace",
            fontSize: 13,
            lineHeight: 1.7,
            color: "var(--foreground, #0f172a)",
            background: "var(--background, #ffffff)",
            overflowY: "auto",
            tabSize: 2,
            whiteSpace: "pre",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            color: "var(--muted, #94a3b8)",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ opacity: 0.4 }}
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <p style={{ fontSize: 14, margin: 0 }}>Select a file to edit</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MiniChat panel
// ---------------------------------------------------------------------------

interface MiniChatProps {
  expanded: boolean;
}

function MiniChat({ expanded }: MiniChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your developer assistant. Ask me anything about your code.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, expanded]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, agentType: "developer" }),
      });
      const data = (await res.json()) as { reply?: string; message?: string };
      const reply =
        data.reply ??
        data.message ??
        "I received your message. (No response body from /api/chat)";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I could not reach the server right now.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sending]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  if (!expanded) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: 280,
        background: "var(--surface, #f8fafc)",
        border: "1px solid var(--border, #e2e8f0)",
        borderRadius: "0 0 12px 12px",
        overflow: "hidden",
      }}
    >
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "7px 12px",
                borderRadius:
                  msg.role === "user"
                    ? "12px 12px 2px 12px"
                    : "12px 12px 12px 2px",
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "var(--background, #ffffff)",
                border:
                  msg.role === "assistant"
                    ? "1px solid var(--border, #e2e8f0)"
                    : "none",
                color:
                  msg.role === "user"
                    ? "#ffffff"
                    : "var(--foreground, #0f172a)",
                fontSize: 12.5,
                lineHeight: 1.5,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "7px 14px",
                borderRadius: "12px 12px 12px 2px",
                background: "var(--background, #ffffff)",
                border: "1px solid var(--border, #e2e8f0)",
                color: "var(--muted, #94a3b8)",
                fontSize: 12,
              }}
            >
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 12px",
          borderTop: "1px solid var(--border, #e2e8f0)",
          background: "var(--background, #ffffff)",
          flexShrink: 0,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your code... (Enter to send)"
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            border: "1px solid var(--border, #e2e8f0)",
            borderRadius: 8,
            padding: "7px 10px",
            fontSize: 12.5,
            fontFamily: "inherit",
            outline: "none",
            color: "var(--foreground, #0f172a)",
            background: "var(--surface, #f8fafc)",
            lineHeight: 1.4,
          }}
        />
        <button
          onClick={() => void send()}
          disabled={sending || !input.trim()}
          aria-label="Send message"
          style={{
            padding: "7px 14px",
            borderRadius: 8,
            border: "none",
            background:
              sending || !input.trim() ? "#c7d2fe" : "#6366f1",
            color: "#ffffff",
            fontSize: 12,
            fontWeight: 600,
            cursor: sending || !input.trim() ? "not-allowed" : "pointer",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WorkspacePage
// ---------------------------------------------------------------------------

export default function WorkspacePage() {
  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // File tree state
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [selectedFileNode, setSelectedFileNode] = useState<FileNode | null>(null);
  const [code, setCode] = useState<string>("");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(["src", "src/app", "src/components"])
  );

  // Chat
  const [chatExpanded, setChatExpanded] = useState(false);

  // Load projects
  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: { projects?: Project[] }) => {
        const list = data.projects ?? [];
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0].id);
      })
      .catch(() => {
        // silently fail — workspace still usable without projects
      });
  }, []);

  const handleSelectFile = useCallback((path: string, node: FileNode) => {
    setSelectedFilePath(path);
    setSelectedFileNode(node);
    setCode(node.content ?? "");
  }, []);

  const handleTogglePath = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  // Pre-select first file for better UX
  useEffect(() => {
    if (!selectedFilePath) {
      const allFiles = flattenTree(SIMULATED_FILE_TREE);
      const first = allFiles.find((f) => f.node.type === "file");
      if (first) handleSelectFile(first.path, first.node);
    }
  }, [selectedFilePath, handleSelectFile]);

  return (
    <AppShell title="Workspace">
      <InfoBanner />

      {/* Two-panel layout */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        {/* LEFT panel */}
        <LeftPanel
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          selectedFilePath={selectedFilePath}
          onSelectFile={handleSelectFile}
          expandedPaths={expandedPaths}
          onTogglePath={handleTogglePath}
        />

        {/* RIGHT panel + chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
          <RightPanel
            selectedFilePath={selectedFilePath}
            selectedFileNode={selectedFileNode}
            code={code}
            onCodeChange={setCode}
          />

          {/* ANu Chat toggle tab */}
          <button
            onClick={() => setChatExpanded((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: chatExpanded
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "var(--surface, #f1f5f9)",
              border: "1px solid var(--border, #e2e8f0)",
              borderTop: chatExpanded ? "none" : "1px solid var(--border, #e2e8f0)",
              borderBottom: chatExpanded ? "none" : "1px solid var(--border, #e2e8f0)",
              borderRadius: chatExpanded ? "12px 12px 0 0" : "0 0 12px 12px",
              marginTop: chatExpanded ? 16 : 0,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: chatExpanded ? "#ffffff" : "var(--foreground, #374151)",
              transition: "background 0.15s, color 0.15s",
              justifyContent: "space-between",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              ANu Developer Chat
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{
                transform: chatExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>

          <MiniChat expanded={chatExpanded} />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AppShell>
  );
}
