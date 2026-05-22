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
      subsystems: [
        { name: "Graph Engine", purpose: "Compute semantic deltas", status: "healthy" },
        { name: "Orchestrator", purpose: "Manages agent lifecycle", status: "healthy" },
        { name: "Telemetry Sink", purpose: "Aggregates runtime events", status: "degraded" }
      ]
    },
    runtime: {
      buildStatus: "success",
      deploymentState: "production",
      testResults: {
        passed: 142,
        failed: 0,
        total: 142,
        coverage: 88,
        lastRun: "2026-05-09T11:45:00Z"
      },
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
      errorLogs: [
        { timestamp: "2026-05-09T10:30:00Z", service: "Build Engine", message: "TypeScript compilation failed: src/engine/diff.ts(42,12): error TS2304: Cannot find name 'Node'.", level: "error" },
        { timestamp: "2026-05-09T09:15:00Z", service: "Deployment", message: "Health check timed out for container 'cl-graph-engine-v2'. Retrying...", level: "warning" },
        { timestamp: "2026-05-08T22:45:00Z", service: "Orchestrator", message: "Gemini API rate limit exceeded. Falling back to cached semantic snapshots.", level: "warning" },
        { timestamp: "2026-05-08T14:12:00Z", service: "Telemetry", message: "Database connection pools exhausted. Increasing max connections to 50.", level: "error" }
      ],
      telemetry: {
        latency: 142,
        latencyHistory: [
          { time: '00:00', value: 120 },
          { time: '04:00', value: 150 },
          { time: '08:00', value: 110 },
          { time: '12:00', value: 160 },
          { time: '16:00', value: 142 },
          { time: '20:00', value: 130 },
          { time: '23:59', value: 135 },
        ],
        errors: 0,
        coverage: 88,
      }
    },
    continuity: {
      lastActiveFile: "src/engine/diff.ts",
      tabs: ["src/engine/diff.ts", "src/App.tsx", "package.json"],
      cursorPosition: { line: 42, ch: 12 },
      activeDebugSession: true,
      localEnvironmentState: "warm"
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
        latencyHistory: [
          { time: '00:00', value: 280 },
          { time: '04:00', value: 320 },
          { time: '08:00', value: 290 },
          { time: '12:00', value: 350 },
          { time: '16:00', value: 310 },
          { time: '20:00', value: 300 },
          { time: '23:59', value: 315 },
        ],
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
        latencyHistory: [
          { time: '00:00', value: 38 },
          { time: '04:00', value: 45 },
          { time: '08:00', value: 40 },
          { time: '12:00', value: 50 },
          { time: '16:00', value: 42 },
          { time: '20:00', value: 39 },
          { time: '23:59', value: 41 },
        ],
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
