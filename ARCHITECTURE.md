# ARCHITECTURE.md: intenTidy

## HIGH-LEVEL ARCHITECTURE
intenTidy follows a **Hybrid Full-Stack Architecture** composed of a highly responsive **React Client** and a secure **Express Backend (BFF)**. The Express backend handles secure Gemini API proxying, robust CORS headers, and persistent card state, while the React client renders the primary orchestration dashboard, Sparkline visualizers, and stateful cards.

**[Confidence: High]**

---

## COMPONENT BREAKDOWN

- **`server.ts` (The Express Backend & BFF Gateway)**:
  - Serves as the Backend-for-Frontend (BFF) secure layer.
  - Implements API endpoints `/api/gemini/*` to proxy AI analysis prompts and natural language intent parsing (`/api/gemini/parse-intent`), completely isolating `GEMINI_API_KEY` from the browser with fallback heuristic engines for high-availability.
  - Hosts Git proxy endpoints (`/api/git/repo-info`, `/api/git/diffs`, `/api/git/sync/:id`) that interact with GitHub APIs while falling back cleanly to card metadata.
  - Ingests CI/CD webhooks (`/api/webhooks/github`) and dispatches deployment triggers (`/api/deployments/trigger`, `/api/deployments/:id/status`).
  - Implements OpenTelemetry/Prometheus observability: exposes live ingestion (`POST /api/telemetry/ingest`), aggregate stats (`GET /api/telemetry/stats`), and standard Prometheus metrics scraping (`GET /metrics`).
  - Manages durable JSON file-based database persistence (`/data/cards.json`) with unified REST CRUD endpoints (`GET /api/cards`, `POST /api/cards`, `DELETE /api/cards/:id`).
  - Integrates Vite as middleware for hot-reloaded SPA development, and serves compiled production static assets in staging/production.
- **`App.tsx` (The Controller)**:
  - Coordinates global state by hydrating from the `/api/cards` REST endpoints on mount.
  - Controls view mode switching between the standard **Cards Grid** and the interactive **Topology Map (MultiView)**.
  - Manages sorting (Alphabetical, Recent Sync, Build Status) and multi-tag filtering mechanisms.
  - Coordinates the Voice-to-Intent modal and translates parsed agentic commands into immediate state mutations.
  - Employs non-blocking intelligence modals for cluster summarization and voice operations.
- **`CardView.tsx` (The Organism)**:
  - Memoized via `React.memo` for optimal render cycles and zero redundant re-renders.
  - Renders the interactive layout of an individual "PortableCard."
  - Contains nested tab navigation between "Overview" and "System Logs."
  - Mounts the **Quick Actions** semantic toolbar ('Review Diffs', 'Analyze Architecture', 'Generate Scaffold', 'Create Task', 'Trigger Deployment', 'Sync Git').
  - Captures and displays robust AI analysis errors with dismissible warnings via `aiError` state tracking.
- **`MultiView.tsx` (Cross-Card Topology Mapping)**:
  - Visualizes complex cross-system architectures with SVG spline connectors, dependency badges, directional data flow links, and topology metrics.
  - Supports dynamic link creation between systems (e.g. `consumes-api`, `depends-on`, `data-pipeline`).
- **`VoiceIntentModal.tsx` & `services/audio.ts` (Agentic Intent Layer)**:
  - Uses the browser's Web Speech API to capture natural language commands and streams them to `/api/gemini/parse-intent`.
  - Parses commands into actionable JSON operations (`add_task`, `add_goal`, `set_blocker`, `trigger_deploy`, `create_card`) with instant 1-click execution.
- **`services/git.ts` (Client Git Service Layer)**:
  - Provides proxy client calls to `/api/git/*` to fetch live commits, diffs, and repository synchronization.
- **`services/gemini.ts` (Client Service Layer)**:
  - Provides simplified helper functions (`summarizeProject`, `generateSuggestions`, `generateArchitectureOverview`).
  - Proxies calls strictly to `/api/gemini/*` endpoints to protect API key configurations.

---

## DATA FLOW
**[Confidence: High]**

1. **Hydration**: On mount, `App.tsx` fetches the complete list of system cards from `GET /api/cards`. The server automatically seeds the database file `/data/cards.json` with standard `SAMPLE_CARDS` if it is initialized on a clean slate.
2. **Persistence Mutation**: When cards are added, edited, or deleted, corresponding `POST` or `DELETE` fetch requests are triggered asynchronously. The Express server safely saves state changes to disk.
3. **Telemetry & Write Storm Protection**: Simulated telemetry jitter updates the `cards` state purely on the client-side every 3 seconds. By decoupling these high-frequency visual jitter updates from database save operations, we protect our server database from excessive write storms.
4. **AI Processing**: When an architecture re-analysis is requested, the client triggers `generateArchitectureOverview`. This is proxied to the server, processed using the `@google/genai` Node.js SDK, and the computed schema is merged back into client state. If AI services are rate-limited or offline, heuristic fallback engines preserve full interactivity without throwing uncaught client errors.
5. **Observability Ingestion**: External monitoring agents or CI/CD pipelines push real metrics via `POST /api/telemetry/ingest`. Global metrics are scraped in Prometheus format via `GET /metrics`.

---

## SECURITY MODEL
**[Confidence: High]**

- **Secret Isolation**: `GEMINI_API_KEY` resides strictly in the environment variables of the server-side container. It is never exposed in client configuration, Vite define blocks, or browser network payloads.
- **Sanitized Failures**: AI analysis errors or network timeouts are trapped in try/catch blocks on both the client and server. If an AI call fails, the UI gracefully presents an error banner while preserving all other interactive functionalities.
- **No Blocking Alerts**: Replaced all intrusive modal alerts (`alert()`) with non-blocking reactive dialogs to ensure smooth operation within iframe sandboxes and native viewports.

---

## DEPLOYMENT MODEL
**[Confidence: High]**

- **Runtime**: Node.js environment.
- **Build System**: Vite compiles static frontend bundles to `dist/`, while `esbuild` bundles `server.ts` into a standalone, single-file CommonJS production server at `dist/server.cjs`.
- **Target Platform**: Cloud Run (autoscaled, running container-ingress on port 3000).
- **Start Command**: Standalone execution via `node dist/server.cjs`.

---

## COMPLETED ARCHITECTURAL RISKS MITIGATION

1. **Security Vulnerability (Mitigated)**: Removed the direct bundling of `GEMINI_API_KEY` on the client. All AI processing is handled behind our BFF proxy.
2. **Performance Bottleneck (Mitigated)**: Isolated visual telemetry loops from persistence operations, eliminating DB write storms and memoizing `CardView` with `React.memo`.
3. **Data Fragility (Mitigated)**: Swapped volatile browser-only `localStorage` for durable, device-agnostic, server-side persistence (`/data/cards.json`).
4. **Zero-Telemetry Realism (Mitigated)**: Implemented OpenTelemetry-compatible webhook ingestion (`/api/telemetry/ingest`) and Prometheus metrics scraping (`/metrics`).
5. **Architectural Brittle Failure (Mitigated)**: Built local rule-based heuristic engines for suggestions, summaries, architecture specs, and speech-to-intent to ensure 100% portfolio reliability even during external API quota limits.
