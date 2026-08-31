# intenTidy

**Orchestration Intelligence for Autonomous Software Entities.**

intenTidy is an enterprise semantic mobile orchestration layer designed to bridge the gap between heavy desktop execution environments (IDEs) and cross-device software management. It conceptualizes distributed software systems as "PortableCards"—autonomous, lightweight, AI-enhanced snapshots equipped with memory, telemetry, and intent.

---

## Overview

Traditional mobile git clients struggle by attempting to compress desktop file trees and terminal logs into small touch screens. **intenTidy** inverts this pattern:
- **Repository -> Card**: A repository is the implementation; a card is the cognitive, semantic snapshot.
- **Semantic Navigation**: Move through architectures via capabilities, goals, blockers, and topologies rather than just raw files.
- **Orchestration Continuity**: Your mobile device or browser becomes a responsive command center for multi-system health, deployment triggers, and agentic updates.

---

## Features

- **🛡️ Secure AI Architecture Review**: Powered by Google Gemini 2.5 Flash via a secure Backend-for-Frontend (BFF) Express proxy. Generates capability maps, subsystem breakdowns, and architecture overviews without exposing API keys to the browser.
- **🏢 Multi-Tenant Workspace Partitioning**: Isolate systems across teams or environments (`default`, `engineering`, `security-ops`, or custom). Data is partitioned on disk (`/data/workspaces/<id>/cards.json`) with an interactive switcher and inline creation modal.
- **🔐 Cryptographic Authentication & RBAC**:
  - HS256 HMAC JWT session authentication (`/api/auth/token`, `/api/auth/me`).
  - Strict hierarchical permissions:
    - **Viewer**: Read-only inspection of cards and telemetry.
    - **Operator**: Create, edit, deploy, and sync systems.
    - **Owner**: Full administrative access, including card deletion and workspace creation.
  - Interactive role switcher in the UI with animated warning alerts on unauthorized actions.
- **⚡ Real-Time Push Events (SSE)**: Server-Sent Events connection hub (`GET /api/events`) streams live state mutations (`card:created`, `card:updated`, `card:deleted`, `card:synced`, `deployment:triggered`) to connected clients with an active connection indicator.
- **🔒 Ingress Webhook Verification & Rate Limiting**:
  - GitHub CI/CD webhooks (`POST /api/webhooks/github`) cryptographically validated using HMAC-SHA256 (`X-Hub-Signature-256`) and timing-safe comparison.
  - Sliding-window rate limiting emitting standard `RateLimit-*` headers with HTTP 429 response handling.
- **🎙️ Agentic Voice-to-Intent**: Dictate goals, tasks, blockers, or deployment triggers in natural language. Speech is captured via the Web Speech API and translated by Gemini into structured executable operations with 1-click execution.
- **🌐 Cross-System Topology Mapping (MultiView)**: An interactive bird's-eye topology view mapping dependencies, data pipelines, and shared libraries across multiple PortableCards.
- **📊 Real Observability & Metrics Scraper**: 
  - OpenTelemetry / Prometheus metric ingestion endpoint (`POST /api/telemetry/ingest`).
  - System health aggregates (`GET /api/telemetry/stats`).
  - Standard Prometheus scraping endpoint (`GET /metrics`) ready for Grafana and Prometheus monitoring stacks.
  - Container liveness and readiness probe endpoint (`GET /api/health`).
- **🛡️ 100% Uptime Fallback Heuristic Engine**: Resilient multi-tier architecture with rule-based heuristic engines for architecture reviews, maintenance suggestions, project summaries, and speech parsing, guaranteeing zero disruption during API rate limits or offline scenarios.
- **⚡ Memoized Performance & Non-Blocking UI**:
  - `CardView` memoized using `React.memo` for isolated render cycles.
  - Zero browser-blocking dialogs (`alert()`), replaced with fluid reactive modals (`Inventory Intelligence`, `VoiceIntentModal`, `InfoModal`).
  - UI telemetry jitter decoupled from disk persistence to eliminate write-back storms.

---

## 🔌 API Architecture & Endpoints

| Endpoint | Method | Role Required | Description |
| :--- | :--- | :---: | :--- |
| `/api/auth/token` | `POST` | Public | Issue a signed HS256 JWT session token with specified role |
| `/api/auth/me` | `GET` | Bearer Token | Verify JWT token claims, identity, and role hierarchy |
| `/api/workspaces` | `GET` | Viewer | List all available multi-tenant workspaces |
| `/api/workspaces` | `POST` | Owner | Create and initialize a new isolated workspace partition |
| `/api/cards` | `GET` | Viewer | Retrieve all PortableCards within the active workspace |
| `/api/cards` | `POST` | Operator | Create or update a PortableCard in the active workspace |
| `/api/cards/:id` | `DELETE` | Owner | Delete a PortableCard from persistent storage |
| `/api/events` | `GET` | Viewer | Server-Sent Events (SSE) stream for live real-time sync |
| `/api/gemini/suggestions` | `POST` | Operator | Autonomous maintenance action generation with fallback |
| `/api/gemini/summarize` | `POST` | Viewer | Single-sentence semantic context summarization |
| `/api/gemini/architecture` | `POST` | Operator | Deep architectural and subsystem analysis |
| `/api/gemini/parse-intent` | `POST` | Operator | Agentic natural language voice command parsing |
| `/api/telemetry/ingest` | `POST` | Operator | Ingest OpenTelemetry/Prometheus metrics from external agents |
| `/api/telemetry/stats` | `GET` | Viewer | Aggregate latency, error spikes, and build health metrics |
| `/metrics` | `GET` | Public | Standard plaintext Prometheus metrics scraper endpoint |
| `/api/health` | `GET` | Public | Container liveness and readiness probe endpoint |
| `/api/git/repo-info` | `GET` | Viewer | Proxy repository metadata, branches, and commit status |
| `/api/git/diffs` | `GET` | Viewer | Retrieve structured file diffs for semantic review |
| `/api/git/sync/:id` | `POST` | Operator | Trigger repository synchronization snapshot |
| `/api/deployments/trigger` | `POST` | Operator | Trigger production build and deployment pipeline |
| `/api/webhooks/github` | `POST` | HMAC Signed | Ingress for CI/CD webhook events (`X-Hub-Signature-256`) |

---

## 🛠️ Technology Stack

- **Frontend**: React 19 & Vite 6 (ESM) styled with Tailwind CSS v4
- **Backend**: Express Server (Node.js) handling proxy endpoints, authentication, and persistent storage
- **Animations**: `motion/react` (Motion v12)
- **Intelligence**: Google Gemini 2.5 Flash via secure backend proxy (`@google/genai`) with local heuristic fallback
- **Icons**: Lucide React
- **Persistence**: Durable Server-Side Partitioned Database (`data/workspaces/`)
- **Observability**: Prometheus `/metrics` + OpenTelemetry ingestion (`/api/telemetry/ingest`)
- **Testing**: Vitest unit, integration, and security test suites (20 tests, 100% passing)
- **DevOps**: Multi-stage Dockerfile (Alpine), Kubernetes manifests, and Helm chart

---

## 📦 Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd intentidy

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` and configure your keys:
```bash
cp .env.example .env
```

```env
# Server-side Gemini API Key (Never exposed to the client)
GEMINI_API_KEY=your_gemini_api_key_here

# Cryptographic secrets
JWT_SECRET=your_secure_jwt_secret_key
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret

# Rate limiting
RATE_LIMIT_MAX_REQUESTS=120
```

---

## 🚀 Running the Application

### Development Mode
Runs the Express BFF server and mounts Vite as middleware on port `3000`:
```bash
npm run dev
```

### Production Build & Run
Compiles the static React frontend and bundles `server.ts` into a standalone CommonJS file (`dist/server.cjs`):
```bash
npm run build
npm run start
```

---

## 🐳 Container & Cloud Deployment

### Docker (Multi-Stage Build)
Build and run the production-hardened container image:
```bash
# Build Docker image
docker build -t intentidy:latest .

# Run container (runs as unprivileged user 'intentidy' on port 3000)
docker run -d -p 3000:3000 \
  -e GEMINI_API_KEY="your_api_key" \
  -e JWT_SECRET="your_jwt_secret" \
  --name intentidy-app intentidy:latest
```

### Kubernetes
Deploy using the native Kubernetes manifests in `deploy/k8s/`:
```bash
kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/deployment.yaml
kubectl apply -f deploy/k8s/service.yaml
kubectl apply -f deploy/k8s/ingress.yaml
```

### Helm Chart
Install via Helm using `deploy/helm/intentidy/`:
```bash
helm install intentidy deploy/helm/intentidy/
```

---

## 🧪 Automated Testing

Execute the complete Vitest automated test suite (20 tests):
```bash
npm run test
```

Run static TypeScript verification:
```bash
npm run lint
```

---

## 🏗️ Architecture & Audit

For complete technical specifications, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System components, data flows, and security model.
- [AUDIT.md](./AUDIT.md) — Complete 11-point security, storage, observability, and compliance audit.
- [REPO_STATUS.md](./REPO_STATUS.md) — Repository maturity metrics and health scores.
- [TODO.md](./TODO.md) — Production alignment tasks and completed specifications log.

---

*Persist project intelligence. Orchestrate outcomes.*
