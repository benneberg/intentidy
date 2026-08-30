# ARCHITECTURE.md: intenTidy

## HIGH-LEVEL ARCHITECTURE
intenTidy follows an **Enterprise Hybrid Full-Stack Architecture** composed of a highly responsive **React 19 SPA Client** and a secure, event-driven **Express BFF (Backend-for-Frontend) Gateway**. The Express backend handles secure Gemini AI API proxying, JWT session authentication, Role-Based Access Control (RBAC), multi-tenant workspace partitioning, cryptographic webhook validation, Server-Sent Events (SSE), OpenTelemetry/Prometheus metrics, and durable persistent card state. The React client renders the primary orchestration dashboard, interactive topology maps, and stateful autonomous software entities.

**[Confidence: High]**

---

## COMPONENT BREAKDOWN

### 1. `server.ts` (The Express BFF Gateway & Service Hub)
- **BFF Secure AI Proxy**: Implements `/api/gemini/*` endpoints (`/suggestions`, `/summarize`, `/architecture`, `/parse-intent`) to proxy calls to Google Gemini (`@google/genai`), completely isolating `GEMINI_API_KEY` from client bundles, with rule-based fallback heuristic engines ensuring 100% continuous uptime.
- **Authentication & RBAC Middleware**:
  - Implements lightweight HS256 HMAC cryptographic token generation (`POST /api/auth/token`) and verification (`GET /api/auth/me`).
  - Enforces hierarchical permissions (`viewer` < `operator` < `owner`) via `requireRole` middleware across mutating endpoints.
- **Multi-Tenant Workspace Partitioning**:
  - Partitions durable JSON storage by workspace ID (`/data/workspaces/<workspaceId>/cards.json`).
  - Exposes workspace management endpoints (`GET /api/workspaces`, `POST /api/workspaces`).
- **Ingress Security & Rate Limiting**:
  - Cryptographically verifies incoming GitHub CI/CD webhooks (`POST /api/webhooks/github`) using `X-Hub-Signature-256` HMAC and constant-time buffer comparison (`crypto.timingSafeEqual`).
  - Enforces sliding-window rate limiting (`RATE_LIMIT_MAX_REQUESTS`) emitting standard `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` HTTP headers.
- **Real-Time Event Hub (Server-Sent Events)**:
  - Exposes `GET /api/events` to stream state mutations (`card:created`, `card:updated`, `card:deleted`, `card:synced`, `deployment:triggered`, `telemetry:ingest`) in real time to connected browser sessions.
- **Observability & Health Engine**:
  - Ingests external OpenTelemetry metrics (`POST /api/telemetry/ingest`).
  - Aggregates latency, error spikes, and build health stats (`GET /api/telemetry/stats`).
  - Exposes standard Prometheus metrics scraping (`GET /metrics`).
  - Provides container liveness and readiness probe endpoint (`GET /api/health`).
- **Git & Deployment Proxies**:
  - Exposes Git metadata and diff endpoints (`/api/git/repo-info`, `/api/git/diffs`, `/api/git/sync/:id`).
  - Exposes deployment dispatch endpoints (`/api/deployments/trigger`, `/api/deployments/:id/status`).

### 2. `App.tsx` (The Client Controller & State Coordinator)
- **Multi-Tenant Hydration**: Hydrates active card inventory from `/api/cards` scoped by `x-workspace-id` header.
- **Role-Based Controls**: Interactive UI role selector (`viewer`, `operator`, `owner`) with animated warning alerts on unauthorized actions.
- **Real-Time SSE Listener**: Connects to `/api/events` with automatic reconnection and a live pulsating visual connection badge.
- **Dual View Modes**: Seamlessly switches between the responsive **Cards Grid** and the interactive SVG **Topology Map (MultiView)**.
- **Voice-to-Intent**: Coordinates the speech modal, streaming captured audio to `/api/gemini/parse-intent` and executing actionable state updates with 1-click application.
- **Decoupled Telemetry**: Visual telemetry jitter runs every 3 seconds purely on the client side, completely decoupled from disk persistence to eliminate write storms.

### 3. `CardView.tsx` (The Autonomous Entity Organism)
- Memoized with `React.memo` with shallow property comparison to isolate re-render cycles.
- Renders autonomous system status, health indicators, tags, and goal progress.
- Dual-tab navigation between "Overview" and "System Logs".
- Quick Actions semantic toolbar: 'Review Diffs', 'Analyze Architecture', 'Create Task', 'Trigger Deployment', 'Sync Git'.

### 4. `MultiView.tsx` (Cross-Card Topology Mapping)
- Visualizes cross-system architectures with SVG spline connectors, dependency badges, directional data flow links, and topology metrics.
- Supports dynamic link creation between systems (e.g. `consumes-api`, `depends-on`, `data-pipeline`).

### 5. `VoiceIntentModal.tsx` & `services/audio.ts` (Agentic Intent Layer)
- Captures natural language commands via browser Web Speech API.
- Proxies commands to `/api/gemini/parse-intent` and renders preview actions (`add_task`, `add_goal`, `set_blocker`, `trigger_deploy`, `create_card`) for user confirmation.

---

## DATA FLOW

```
[External Agents / Webhooks]       [Browser Client (React)]
            |                                  |
            | (HMAC Webhooks / Telemetry)      | (REST / SSE / Bearer JWT)
            v                                  v
+------------------------------------------------------------------------+
|                      Express BFF Gateway (Port 3000)                   |
|                                                                        |
|  [Rate Limiter] -> [Auth / RBAC Middleware] -> [Route Handlers]        |
|                                                                        |
|  +-------------------+  +-------------------+  +--------------------+  |
|  | Multi-Tenant JSON |  | Real-Time SSE Hub |  | AI Heuristic Proxy |  |
|  | /data/workspaces/ |  |    /api/events    |  |   @google/genai    |  |
|  +-------------------+  +-------------------+  +--------------------+  |
|                                                          |             |
+----------------------------------------------------------|-------------+
                                                           v
                                                [Google Gemini 2.5 API]
```

1. **Hydration**: On mount, `App.tsx` queries `GET /api/cards` with `x-workspace-id`. The server initializes and seeds the workspace partition if unpopulated.
2. **Mutation**: When an operator/owner creates, modifies, or deletes a card, an authenticated request (`POST`/`DELETE`) writes atomically to the tenant partition file on disk and broadcasts an SSE event to all connected clients.
3. **Real-Time Push**: Connected clients receive SSE messages on `/api/events` and re-synchronize state instantly without polling.
4. **AI Processing**: Requests to `/api/gemini/*` invoke the `@google/genai` SDK using `process.env.GEMINI_API_KEY`. If rate limits or network issues occur, rule-based heuristic engines seamlessly return structured data.
5. **Observability**: Prometheus scrapers pull `/metrics`, while external CI/CD tools push data to `/api/telemetry/ingest`.

---

## SECURITY MODEL

- **Secret Isolation**: `GEMINI_API_KEY`, `JWT_SECRET`, and `GITHUB_WEBHOOK_SECRET` reside strictly in server environment variables. Zero leakage into browser bundles.
- **Cryptographic JWT Sessions**: HS256 HMAC tokens with tamper detection, expiration validation, and timing-safe signature checks.
- **Role-Based Access Control (RBAC)**:
  - `viewer`: Read-only access to cards, metrics, and workspaces.
  - `operator`: Can create/update cards, run AI analysis, trigger deployments, and sync repositories.
  - `owner`: Full administrative access, including card deletion and workspace creation.
- **Webhook Authenticity**: GitHub CI/CD webhooks are validated using HMAC-SHA256 (`X-Hub-Signature-256`) and `crypto.timingSafeEqual`.
- **Rate Limiting**: Sliding-window rate limiter protects endpoints against denial-of-service attempts.
- **Sanitized Failures**: Try/catch boundaries and non-blocking reactive dialogs guarantee smooth execution within sandboxed iframes.

---

## DEPLOYMENT & CONTAINER ARCHITECTURE

- **Container Image**: Multi-stage hardened `Dockerfile` based on Node 22 Alpine:
  - Stage 1 (`builder`): Compiles React SPA to `dist/` and bundles `server.ts` into a single standalone CommonJS file (`dist/server.cjs`) via `esbuild`.
  - Stage 2 (`runner`): Minimal runtime image running as unprivileged user (`uid 1001: intentidy`) with native health checks (`/api/health`).
- **Kubernetes Manifests** (`deploy/k8s/`):
  - `deployment.yaml`: Configured with 2 replicas, resource requests/limits, Prometheus annotations, and liveness/readiness probes.
  - `service.yaml`: ClusterIP service routing port 80 to container port 3000.
  - `ingress.yaml`: NGINX Ingress controller configuration with SSE timeout buffering.
  - `configmap.yaml`: Application environment parameters.
- **Helm Packaging** (`deploy/helm/intentidy/`):
  - Packaged Helm chart with customizable `values.yaml` supporting autoscaling, ingress, and persistent volume claims.
