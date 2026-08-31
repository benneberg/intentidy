# intenTidy Architecture

This document describes the current production architecture, system components, data flows, persistence strategy, security boundaries, and architectural invariants of **intenTidy**.

---

## 1. System Overview & Boundaries

intenTidy is a full-stack semantic orchestration platform that models distributed software systems as autonomous, stateful entities known as **PortableCards**. 

The system operates across two primary architectural tiers hosted in a unified Node.js process:
1. **Frontend Tier (React 19 SPA)**: A high-density client application rendering multi-card inventory, interactive dependency topologies (`MultiView`), diff reviews, telemetry charts, and agentic voice-intent interfaces.
2. **Backend-for-Frontend Gateway (`server.ts`)**: An Express-based gateway managing AI orchestration, cryptographic authentication, role-based authorization, multi-tenant disk storage, real-time push events via Server-Sent Events (SSE), OpenTelemetry/Prometheus observability, and Git proxies.

```
+----------------------------------------------------------------------------------+
|                                    CLIENT TIER                                   |
|                                                                                  |
|   +-------------------+    +----------------------+    +---------------------+   |
|   |    CardView       |    |  MultiView Topology  |    |  VoiceIntentModal   |   |
|   |  (Entity State)   |    |    (Dependencies)    |    |  (Speech-to-Intent) |   |
|   +---------+---------+    +----------+-----------+    +----------+----------+   |
|             |                         |                           |              |
|             +-------------------------+---------------------------+              |
|                                       |                                          |
|                          HTTP / SSE (Bearer Token)                               |
+---------------------------------------|------------------------------------------+
                                        v (Port 3000)
+----------------------------------------------------------------------------------+
|                                 EXPRESS BFF TIER                                 |
|                                                                                  |
|  [Rate Limiter] ---> [Auth & RBAC Middleware] ---> [Controller Endpoints]       |
|                                                                                  |
|  +---------------------+   +---------------------+   +------------------------+  |
|  | Multi-Tenant Store  |   | Real-Time SSE Hub   |   | External AI Proxy &    |  |
|  | /data/workspaces/   |   |    /api/events      |   | Heuristic Fallback     |  |
|  +---------------------+   +---------------------+   +-----------+------------+  |
|                                                                  |               |
+------------------------------------------------------------------|---------------+
                                                                   v
                                                        [Google Gemini 2.5 API]
```

---

## 2. Component Breakdown & Responsibilities

### 2.1 Backend-for-Frontend Gateway (`server.ts`)
- **Server Lifecycle & Ingress**: Listens on `0.0.0.0:3000`. In development, it integrates Vite via `middlewareMode: true`. In production, it serves precompiled assets from `dist/` with SPA routing fallback.
- **Security & Rate Limiting**:
  - Sliding-window in-memory rate limiter emitting standard `RateLimit-*` headers.
  - Cryptographic token authentication using HS256 HMAC JWT.
  - Hierarchical Role-Based Access Control (`viewer` < `operator` < `owner`).
  - Cryptographic validation of incoming GitHub CI/CD webhooks (`X-Hub-Signature-256`).
- **AI Orchestration**: Proxies semantic queries to Google Gemini 2.5 Flash (`@google/genai`). Protects the secret `GEMINI_API_KEY` on the server and provides instant local heuristic fallbacks on network failures or quota exhaustion.
- **Multi-Tenant State Management**: Reads and writes partitioned JSON data stores located at `data/workspaces/<workspaceId>/cards.json`.
- **Real-Time Event Broadcasting**: Maintains active Server-Sent Events (SSE) connections on `/api/events`, dispatching state mutations (`card:created`, `card:updated`, `card:deleted`, `card:synced`, `deployment:triggered`, `telemetry:ingest`) across connected clients.
- **Observability Engine**: Exposes a Prometheus scraper endpoint (`/metrics`), an OpenTelemetry-compatible ingestion endpoint (`POST /api/telemetry/ingest`), and aggregate statistics (`GET /api/telemetry/stats`).

### 2.2 Client Controller (`src/App.tsx`)
- **State Coordination**: Loads and maintains the active card collection scoped by workspace ID (`x-workspace-id` request header).
- **Session & Identity**: Tracks the active user session and role (`viewer`, `operator`, `owner`), providing an interactive role switcher and user notifications for authorization boundaries.
- **Real-Time Connection Management**: Subscribes to `/api/events` via native browser `EventSource` with automated backoff and reconnect handling.
- **View Routing**: Switches seamlessly between the primary Card Inventory Grid and the SVG-based System Topology Map (`MultiView`).
- **Telemetry Decoupling**: Runs periodic local telemetry jitter animation every 3 seconds purely in memory, preventing unnecessary disk I/O.

### 2.3 Entity Organism (`src/components/CardView.tsx`)
- **Performance Optimization**: Memoized via `React.memo` with custom property comparison to prevent cascading re-renders when other cards update.
- **Tab Navigation**: Renders system metadata, health indicators, blockers, active tasks, git status, and telemetry charts under the "Overview" tab, and runtime audit messages under "System Logs".
- **Action Dispatcher**: Dispatches operations for diff inspection, architectural review, task toggling, and deployment triggers.

### 2.4 Topology Graph (`src/components/MultiView.tsx`)
- **Cross-Card Dependency Mapping**: Renders dynamic SVG cubic bezier curves connecting systems based on `topology.links` (`consumes-api`, `depends-on`, `data-pipeline`).
- **Interactive Link Builder**: Enables operators to create directional dependency edges between systems, saving mutations directly to the active workspace.

### 2.5 Voice & Natural Language Intent (`src/components/VoiceIntentModal.tsx`)
- **Speech Capture**: Records spoken developer input via the browser Web Speech API (`webkitSpeechRecognition`).
- **Semantic Translation**: Sends transcripts to `/api/gemini/parse-intent` for conversion into structured actions (`add_task`, `add_goal`, `set_blocker`, `trigger_deploy`, `create_card`).
- **Review & Execution**: Renders parsed operations for confirmation before mutating the workspace state.

---

## 3. Data Flow & Communication Patterns

### 3.1 Initial Hydration
1. Client mounts and issues `GET /api/cards` with `x-workspace-id: <id>`.
2. Backend inspects `data/workspaces/<id>/cards.json`. If uninitialized, the server creates the partition and seeds default system cards.
3. Client populates internal memory and initiates an SSE subscription to `GET /api/events`.

### 3.2 State Mutation & Real-Time Sync
1. An operator performs an action (e.g., creating a card, adding a goal, triggering a deployment).
2. The client sends an authenticated REST request (`POST /api/cards`, `POST /api/deployments/trigger`, etc.) with `Authorization: Bearer <jwt>` and `x-workspace-id`.
3. The Express middleware validates the token and confirms the user possesses the required role.
4. The handler updates memory, writes the updated array atomically to `data/workspaces/<workspaceId>/cards.json`, and invokes `broadcastRealtimeEvent(eventType, payload, workspaceId)`.
5. The SSE Hub pushes the event to all connected browser sessions. Receiving clients re-synchronize state without full-page reloads.

### 3.3 External Ingress (Webhooks & Telemetry)
1. **GitHub CI/CD Webhooks**: Pushed to `POST /api/webhooks/github`. If `GITHUB_WEBHOOK_SECRET` is configured, the payload is validated against `X-Hub-Signature-256`. The server matches the repository name to a registered card, updates its `buildStatus` and `lastCommit`, appends any error logs, persists the change, and emits an SSE event.
2. **OpenTelemetry / Prometheus Metrics**: Pushed to `POST /api/telemetry/ingest`. If latency exceeds 500ms or errors exceed 5, the card status automatically transitions to `degraded` and logs a warning alarm.

---

## 4. State Persistence & Multi-Tenancy

- **Physical Storage**: State is persisted on the local filesystem partitioned by workspace:
  ```
  data/
  └── workspaces/
      ├── default/
      │   └── cards.json
      ├── engineering/
      │   └── cards.json
      └── security-ops/
          └── cards.json
  ```
- **Partition Isolation**: File paths are constructed strictly via sanitized workspace identifiers (`/^[a-zA-Z0-9_-]+$/`). Operations in one workspace cannot read, overwrite, or mutate data in another partition.
- **Atomic File Operations**: Updates write the serialized JSON payload to disk synchronously to avoid partial write corruptions.

---

## 5. Security Model & Role Boundaries

### 5.1 Secret Isolation
- Sensitive credentials (`GEMINI_API_KEY`, `JWT_SECRET`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_TOKEN`) are restricted to the server runtime.
- Client bundles contain zero API keys or external secrets.

### 5.2 Role-Based Access Control (RBAC)
Every request passing through `authMiddleware` is assigned a user identity (or guest fallback) with an associated role:

| Endpoint | Method | Role | Functional Purpose |
| :--- | :--- | :---: | :--- |
| `/api/auth/token` | `POST` | Public | Issue HS256 JWT session token |
| `/api/auth/me` | `GET` | Authenticated | Validate token and retrieve claims |
| `/api/workspaces` | `GET` | Viewer | List all available workspaces |
| `/api/workspaces` | `POST` | Operator | Create a new isolated workspace |
| `/api/cards` | `GET` | Viewer | List cards in current workspace |
| `/api/cards` | `POST` | Operator | Create or update a PortableCard |
| `/api/cards/bulk` | `POST` | Operator | Bulk update multiple cards |
| `/api/cards/:id` | `DELETE` | Owner | Permanently remove a card |
| `/api/events` | `GET` | Viewer | Server-Sent Events real-time stream |
| `/api/gemini/suggestions` | `POST` | Operator | Generate maintenance suggestions |
| `/api/gemini/summarize` | `POST` | Viewer | Generate semantic project summary |
| `/api/gemini/architecture` | `POST` | Operator | Run AI architectural subsystem analysis |
| `/api/gemini/parse-intent` | `POST` | Operator | Parse natural language voice commands |
| `/api/git/repo` | `GET` | Viewer | Proxy repository metadata and commit info |
| `/api/git/diffs` | `GET` | Viewer | Retrieve structured file diffs |
| `/api/git/sync/:id` | `POST` | Operator | Sync card git commit state |
| `/api/deployments/trigger` | `POST` | Operator | Dispatch deployment pipeline |
| `/api/deployments/history` | `GET` | Viewer | Retrieve recent deployment log history |
| `/api/webhooks/github` | `POST` | HMAC Verified | Ingress for CI/CD webhook events |
| `/api/telemetry/ingest` | `POST` | Operator | Ingest OpenTelemetry/Prometheus metrics |
| `/api/telemetry/stats` | `GET` | Viewer | Fetch aggregate system telemetry |
| `/metrics` | `GET` | Public | Standard Prometheus scraping endpoint |

---

## 6. Architectural Invariants

1. **Port Standard**: The service binds exclusively to port `3000` (`0.0.0.0:3000`).
2. **Zero External Client Key Exposure**: No third-party API keys exist in client-side code.
3. **100% Deterministic Fallback on Outages**: All calls to external AI services must possess deterministic local heuristic fallback handlers. External API outages or rate limits must never crash the service or produce unhandled errors.
4. **Non-Blocking UI Execution**: Synchronous blocking browser dialogs (`window.alert`, `window.confirm`, `window.prompt`) are strictly forbidden. All user alerts and confirmations must utilize non-blocking React components.
5. **Multi-Tenant State Segregation**: Cards must always belong to a specific workspace; global unpartitioned storage is disallowed.

---

## 7. Testing Boundaries & Verification Strategy

The architecture is verified via a 20-test automated Vitest test suite executing in under 1 second (`npm test`):

### 7.1 Core Logic Unit Tests (`src/__tests__/logic.spec.ts` — 10 Tests)
- **Tag Filtering**: Verifies tag intersection and matching.
- **Search Precision**: Verifies keyword search across names, descriptions, and stacks.
- **Sorting Invariants**: Tests chronological sorting by timestamp, alphabetical ordering, and health priority (`failed` > `degraded` > `success`).
- **Goal & Task Transitions**: Verifies immutable goal mutations and task toggles (`todo` <-> `done`).
- **Telemetry Health Degradation**: Verifies automated status transition to `degraded` when metrics breach error or latency thresholds.
- **AI Heuristic Fallbacks**: Verifies that when network requests fail or return HTTP 500, the client services return structured local fallback data without throwing unhandled exceptions.

### 7.2 Security & Integration Tests (`src/__tests__/security-and-e2e.spec.ts` — 10 Tests)
- **JWT Cryptography**: Tests valid token signing and HS256 signature verification.
- **Tampered Token Defense**: Verifies immediate rejection when payload claims or signatures are altered.
- **Expiration Handling**: Verifies rejection of expired tokens.
- **RBAC Enforcement**: Validates role hierarchy (`viewer` < `operator` < `owner`).
- **HMAC Webhook Verification**: Verifies acceptance of authentic GitHub signatures and rejection of forged signatures.
- **Multi-Tenant Partition Isolation**: Verifies that updates written to one workspace partition do not affect another partition.
- **Sliding-Window Rate Limiter**: Verifies request tracking, header generation, and HTTP 429 response upon quota exhaustion.
- **Telemetry Degradation Detection**: Validates automated status alerting on metric threshold breaches.
