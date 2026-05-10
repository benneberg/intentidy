/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortableCard } from "./types";

export const SAMPLE_CARDS: PortableCard[] = [
  {
    id: "pc-001",
    name: "PersonaLinea",
    owner: "benneberg",
    tags: ["core", "semantic", "orchestration"],
    status: "active",
    lastSync: "2026-05-09T12:00:00Z",
    repoUrl: "https://github.com/intentidy/personalinea",
    deployUrl: "https://personalinea.io",
    summary: {
      description: "Semantic project lineage and orchestration platform.",
      architecture: "Event-driven microservices with a semantic graph layer.",
      capabilities: ["Lineage tracking", "Intelligent mapping", "Agentic orchestration"],
      techStack: ["React", "Express", "Gemini API", "PostgreSQL"],
    },
    runtime: {
      buildStatus: "success",
      deploymentState: "production",
      lastCommit: {
        hash: "7d3a2f1",
        message: "feat: implement semantic snapshot differ",
        author: "benneberg",
      },
      diffs: [
        {
          file: "src/engine/diff.ts",
          changes: [
            { type: "add", content: "+ export function semanticDiff(a: Node, b: Node) {", line: 42 },
            { type: "add", content: "+   return graph.computeDelta(a, b);", line: 43 },
            { type: "modify", content: "! const delta = oldCompute(a, b);", line: 40 }
          ]
        }
      ],
      telemetry: {
        latency: 142,
        errors: 0,
        coverage: 88,
      }
    },
    intent: {
      goals: ["Achieve full semantic coverage", "Implement cross-card agent communication"],
      tasks: [
        { id: "t1", title: "Refactor snapshot logic", status: "in-progress" },
        { id: "t2", title: "Add telemetry webhooks", status: "todo" },
      ],
      blockers: ["Waiting for Gemini-3 API availability in region"],
    },
    suggestions: [
      {
        id: "s1",
        type: "performance",
        message: "Semantic diffing taking > 500ms for large snapshots.",
        actions: ["Optimize graph traversal", "Implement partial diffs"],
      }
    ]
  },
  {
    id: "pc-002",
    name: "Authentication System",
    owner: "benneberg",
    tags: ["security", "infra"],
    status: "active",
    lastSync: "2026-05-09T12:10:00Z",
    summary: {
      description: "Unified auth and identity service for the Decker ecosystem.",
      architecture: "Stateless JWT auth with OAuth2 delegation.",
      capabilities: ["Multi-provider login", "Automatic session refreshing", "Role-based access"],
      techStack: ["Node.js", "Redis", "OpenID Connect"],
    },
    runtime: {
      buildStatus: "success",
      deploymentState: "staging",
      lastCommit: {
        hash: "a1a4b9c",
        message: "fix: oauth refresh token rotation bug",
        author: "security-bot",
      },
      telemetry: {
        latency: 310,
        errors: 3,
        coverage: 91,
      }
    },
    intent: {
      goals: ["Pass security audit", "Reduce login latency < 300ms"],
      tasks: [
        { id: "t3", title: "Implement MFA", status: "todo" },
      ],
      blockers: [],
    },
    suggestions: [
      {
        id: "s2",
        type: "security",
        message: "I detected 3 failed login edge cases since last deploy.",
        actions: ["Add retry throttling", "Generate test coverage", "Patch OAuth refresh race condition"],
      }
    ]
  },
  {
    id: "pc-003",
    name: "Data Deck",
    owner: "benneberg",
    tags: ["data", "visualization"],
    status: "experimental",
    lastSync: "2026-05-09T11:45:00Z",
    summary: {
      description: "High-performance data visualization for semantic snapshots.",
      architecture: "Canvas-based rendering engine.",
      capabilities: ["Drill-down exploration", "Vector embeddings visualization"],
      techStack: ["D3.js", "Three.js", "WASM"],
    },
    runtime: {
      buildStatus: "success",
      deploymentState: "staging",
      lastCommit: {
        hash: "f2a1e4b",
        message: "perf: optimize canvas rendering with WASM/Rust core",
        author: "benneberg",
      },
      diffs: [
        {
          file: "src/core/rendering.rs",
          changes: [
            { type: "add", content: "+ #[wasm_bindgen]", line: 1 },
            { type: "add", content: "+ pub fn draw_layer(ctx: &CanvasContext, layer: &Layer) {", line: 2 },
            { type: "modify", content: "! // Switched to high-performance SIMD paths", line: 120 }
          ]
        },
        {
          file: "package.json",
          changes: [
            { type: "modify", content: "- \"engine\": \"js-canvas\",", line: 8 },
            { type: "add", content: "+ \"engine\": \"wasm-core\",", line: 8 }
          ]
        }
      ],
      telemetry: {
        latency: 42,
        errors: 0,
        coverage: 94,
      }
    },
    intent: {
      goals: ["Maintain WASM performance parity", "Enable cross-process rendering"],
      tasks: [
        { id: "t4", title: "Debug WebGL context lost error", status: "done" },
        { id: "t5", title: "Implement WASM SIMD optimizations", status: "done" },
        { id: "t6", title: "Benchmark Rust vs JS paths", status: "in-progress" },
      ],
      blockers: [],
    }
  }
];
