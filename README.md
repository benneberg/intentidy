# intenTidy

**Orchestration Intelligence for Autonomous Software Entities.**

An enterprise semantic mobile orchestration layer bridging desktop execution environments and cross-device software management via "PortableCards".

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-green.svg)](https://vitest.dev/)

---

## What It Is

**intenTidy** is a semantic orchestration dashboard designed for mobile-first software management. It abstracts complex repositories and distributed subsystems into "PortableCards"—visual and cognitive snapshots providing architectural overviews, telemetry monitoring, task tracking, and AI-powered summaries. The system provides a high-fidelity command center for developers, architects, and engineering managers to track system health and intent without requiring a full desktop IDE environment.

---

## Why It Exists (Problem Statement)

Developers frequently manage multiple simultaneous projects and struggle with "context drift" when away from their primary workstation. Traditional mobile git clients or CI/CD dashboards focus on raw files, large directories, or verbose build logs, which are cumbersome to parse on small screens. 

intenTidy inverts this pattern:
- **Repository -> Card**: A repository is the implementation; a card is the cognitive, semantic snapshot.
- **Semantic Navigation**: Navigate through architectures via capabilities, goals, blockers, and topologies rather than just raw files.
- **Orchestration Continuity**: Mobile devices and browser windows become responsive command centers for multi-system health, deployment triggers, and agentic updates.

---

## Target Audience & Value Proposition

### Target Audience
- **Lead Developers & Architects**: Maintain a bird's-eye view of distributed subsystems, dependencies, and health without context switching.
- **Engineering Managers**: Review high-level status reports, capability maps, and semantic summaries of recent changes on the go.
- **SRE & DevOps Engineers**: Monitor deployment trends, telemetry metrics, and error logs with real-time push alerts.

### Value Proposition
- **Cognitive Compression**: Uses Gemini AI to turn thousands of lines of code into a single capability map, architectural overview, or plain-English summary.
- **High-Fidelity Mobile UX**: Responsive motion animations (`motion/react`) make high data density manageable across phone, tablet, and desktop viewports.
- **Zero Client Secret Leakage**: All external AI and Git integrations run through a secure Express Backend-for-Frontend (BFF) gateway, keeping credentials strictly server-side.
- **Resilient High Availability**: Multi-tier architecture features local rule-based heuristic engines that automatically take over if external AI APIs hit rate limits or downtime.

---

## Core Capabilities & Features

- **🛡️ Secure AI Architecture Review**: Powered by Google Gemini 2.5 Flash via a secure Backend-for-Frontend (BFF) Express proxy. Generates capability maps, subsystem breakdowns, and architecture overviews without exposing API keys to the browser.
- **🏢 Multi-Tenant Workspace Partitioning**: Isolate systems across teams or environments (`default`, `engineering`, `security-ops`, or custom). Data is partitioned on disk (`/data/workspaces/<id>/cards.json`) with an interactive switcher and inline creation modal.
- **🔐 Cryptographic Authentication & RBAC**:
  - HS256 HMAC JWT session authentication (`/api/auth/token`, `/api/auth/me`).
  - Strict hierarchical permissions:
    - **Viewer**: Read-only inspection of cards and telemetry.
    - **Operator**: Create, edit, deploy, and sync systems.
    - **Owner**: Full administrative access, including card deletion.
  - Interactive role switcher in the UI with animated warning alerts on unauthorized actions.
- **⚡ Real-Time Push Events (SSE)**: Server-Sent Events connection hub (`GET /api/events`) streams live state mutations (`card:created`, `card:updated`, `card:deleted`, `card:synced`, `deployment:triggered`) to connected clients with an active connection indicator.
- **🔒 Ingress Webhook Verification & Rate Limiting**:
  - GitHub CI/CD webhooks (`POST /api/webhooks/github`) cryptographically validated using HMAC-SHA256 (`X-Hub-Signature-256`) and timing-safe comparison.
  - Sliding-window rate limiting emitting standard `RateLimit-*` headers with HTTP 429 response handling.
- **🎙️ Agentic Voice-to-Intent**: Dictate goals, tasks, blockers, or deployment triggers in natural language. Speech is captured via the Web Speech API and translated by Gemini into structured executable operations with 1-click execution.
- **🌐 Cross-System Topology Mapping (MultiView)**: An interactive bird's-eye topology view mapping dependencies, data pipelines, and shared libraries across multiple PortableCards.
- **📊 Observability & Metrics Scraper**: 
  - OpenTelemetry / Prometheus metric ingestion endpoint (`POST /api/telemetry/ingest`).
  - System health aggregates (`GET /api/telemetry/stats`).
  - Standard Prometheus scraping endpoint (`GET /metrics`) ready for Grafana and Prometheus monitoring stacks.
- **🛡️ 100% Uptime Fallback Heuristic Engine**: Resilient multi-tier architecture with rule-based heuristic engines for architecture reviews, maintenance suggestions, project summaries, and speech parsing, guaranteeing zero disruption during API rate limits or offline scenarios.
- **⚡ Memoized Performance & Non-Blocking UI**:
  - `CardView` memoized using `React.memo` for isolated render cycles.
  - Zero browser-blocking dialogs (`alert()`), replaced with fluid reactive modals (`Inventory Intelligence`, `VoiceIntentModal`, `InfoModal`).
  - UI telemetry jitter decoupled from disk persistence to eliminate write-back storms.

---

## API Overview

All API routes run on port `3000`:

| Endpoint | Method | Role Required | Description |
| :--- | :--- | :---: | :--- |
| `/api/auth/token` | `POST` | Public | Issue a signed HS256 JWT session token with specified role |
| `/api/auth/me` | `GET` | Bearer Token | Verify JWT token claims, identity, and role hierarchy |
| `/api/workspaces` | `GET` | Viewer | List all available multi-tenant workspaces |
| `/api/workspaces` | `POST` | Operator | Create and initialize a new isolated workspace partition |
| `/api/cards` | `GET` | Viewer | Retrieve all PortableCards within the active workspace |
| `/api/cards` | `POST` | Operator | Create or update a PortableCard in the active workspace |
| `/api/cards/bulk` | `POST` | Operator | Bulk update multiple PortableCards in the active workspace |
| `/api/cards/:id` | `DELETE` | Owner | Delete a PortableCard from persistent storage |
| `/api/events` | `GET` | Viewer | Server-Sent Events (SSE) stream for live real-time sync |
| `/api/gemini/suggestions` | `POST` | Operator | Autonomous maintenance action generation with fallback |
| `/api/gemini/summarize` | `POST` | Viewer | Single-sentence semantic context summarization |
| `/api/gemini/architecture` | `POST` | Operator | Deep architectural and subsystem analysis |
| `/api/gemini/parse-intent` | `POST` | Operator | Agentic natural language voice command parsing |
| `/api/git/repo` | `GET` | Viewer | Proxy repository metadata, branches, and commit status |
| `/api/git/diffs` | `GET` | Viewer | Retrieve structured file diffs for semantic review |
| `/api/git/sync/:id` | `POST` | Operator | Trigger repository synchronization snapshot |
| `/api/deployments/trigger` | `POST` | Operator | Trigger production build and deployment pipeline |
| `/api/deployments/history` | `GET` | Viewer | Retrieve recent deployment log history |
| `/api/webhooks/github` | `POST` | HMAC Signed | Ingress for CI/CD webhook events (`X-Hub-Signature-256`) |
| `/api/telemetry/ingest` | `POST` | Operator | Ingest OpenTelemetry/Prometheus metrics from external agents |
| `/api/telemetry/stats` | `GET` | Viewer | Aggregate latency, error spikes, and build health metrics |
| `/metrics` | `GET` | Public | Standard plaintext Prometheus metrics scraper endpoint |

---

## Technology Stack

- **Frontend**: React 19, Vite 6 (ESM), Tailwind CSS v4
- **Backend**: Express Server (Node.js) handling API routing, authentication, and state persistence
- **Animations**: `motion/react` (Motion v12)
- **Intelligence**: Google Gemini 2.5 Flash via secure backend proxy (`@google/genai`) with local heuristic fallback
- **Icons**: Lucide React
- **Persistence**: File-backed partitioned JSON storage (`data/workspaces/<id>/cards.json`)
- **Observability**: Prometheus `/metrics` + OpenTelemetry ingestion (`/api/telemetry/ingest`)
- **Testing**: Vitest unit, integration, and security test suites (20 tests, 100% passing)
- **DevOps**: Multi-stage Dockerfile (Alpine), Kubernetes manifests, Helm chart

---

## Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd intentidy

# Install dependencies
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure your credentials:
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

## Running the Application

### Development Mode
Runs the Express BFF server on port `3000` with Vite mounted as middleware:
```bash
npm run dev
```

### Production Build & Start
Compiles static React assets and bundles `server.ts` into a standalone CommonJS file (`dist/server.cjs`):
```bash
npm run build
npm run start
```

---

## Automated Testing

Execute the complete Vitest test suite (20 automated tests):
```bash
npm test
```

Run static TypeScript verification:
```bash
npm run lint
```

---

## Container & Cloud Deployment

### Docker (Multi-Stage Build)
Build and run the production-hardened container:
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
Deploy using native Kubernetes manifests in `deploy/k8s/`:
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

## Authoritative Documentation

For in-depth details on specific domains, refer to the canonical documents:
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System components, data flows, persistence schema, and architectural invariants.
- [SECURITY.md](./SECURITY.md) — Threat model, vulnerability reporting, RBAC hierarchy, and cryptographic verification.
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Development setup, testing requirements, code quality guidelines, and PR workflow.
- [.llm-context/context.md](./.llm-context/context.md) — Technical constraints and guidelines for AI coding agents.
