# TODO: intenTidy Production Alignment & Roadmap

This document outlines active alignment tasks to extend intenTidy in accordance with the project specifications and architecture roadmap. Completed foundational tasks have been verified and archived into the completion log below.

---

## 🎯 ACTIVE ALIGNMENT TASKS

### 1. External Git Connectivity & Octokit Integration
- [ ] **[Live Remote GitHub API Integration]**
  - Integrate `@octokit/rest` into `server.ts` Git proxy endpoints (`/api/git/repo-info`, `/api/git/diffs`).
  - Read optional `GITHUB_TOKEN` from environment to query live remote GitHub commits, branches, and pull request diffs directly, seamlessly falling back to cached card metadata when unauthenticated.
  - Expose branch checkout and commit hash validation directly within the card's Diff Review tab.

### 2. Mobile & Voice Continuity
- [ ] **[Voice-to-Intent Audio Feedback]**
  - Add Web Audio API synthesized chime confirmation and native `speechSynthesis` voice feedback when voice commands are executed (e.g., "Deployment triggered for PersonaLinea").
  - Provide an audio toggle preference saved in user profile settings.

### 3. Interactive Topology Orchestration
- [ ] **[MultiView Interactive Node Drag-and-Drop]**
  - Upgrade `MultiView.tsx` with mouse and touch drag-and-drop node positioning.
  - Persist custom topology coordinates `(x, y)` in `PortableCard.topology` within the workspace's persistent store.
  - Add auto-layout algorithms (force-directed, circular, hierarchical) for multi-node dependency trees.

### 4. Observability & Monitoring Dashboards
- [ ] **[Grafana Dashboard & Prometheus Alertmanager Templates]**
  - Create `deploy/monitoring/grafana-dashboard.json` visualizing P95 latency, error spikes, active workspaces, and SSE connections.
  - Create `deploy/monitoring/prometheus-alerts.yaml` defining automated alerts for system degradation, deployment failures, and rate limit exhaustion.

### 5. Browser Automation & Quality Assurance
- [ ] **[Playwright Headless E2E Automation]**
  - Create `tests/e2e/workflow.spec.ts` simulating the complete user journey:
    1. Workspace creation and switching.
    2. Role switching and permission boundary verification.
    3. Card projection and AI architectural analysis.
    4. Voice modal intent application.
    5. Real-time SSE event reception.

### 6. Workspace Migration & Backup
- [ ] **[Workspace Export / Import Archive]**
  - Add `GET /api/workspaces/:id/export` returning an encrypted or standalone JSON backup of all workspace cards, topology links, and deployment history.
  - Add `POST /api/workspaces/import` to restore or migrate workspaces across clusters and devices.

---

## ✅ COMPLETED SPECIFICATIONS LOG

- **JWT Session & RBAC Layer**: HS256 HMAC cryptographic signing, token validation (`/api/auth/token`, `/api/auth/me`), and role hierarchy enforcement (`viewer` < `operator` < `owner`) on backend routes and frontend controls.
- **Multi-Tenant Workspace Partitioning**: Dynamic workspace isolation (`/data/workspaces/<workspaceId>/cards.json`), workspace CRUD APIs (`/api/workspaces`), and persistent UI workspace switching.
- **Cryptographic Webhook Hardening**: GitHub `X-Hub-Signature-256` HMAC validation via `crypto.timingSafeEqual` against `GITHUB_WEBHOOK_SECRET`.
- **Sliding-Window Rate Limiting**: In-memory rate limiting emitting standard `RateLimit-*` headers with HTTP 429 response handling.
- **Real-Time Push Synchronization**: Server-Sent Events hub (`GET /api/events`) broadcasting live state changes with automatic client hydration and visual SSE status indicator.
- **Automated Testing**: 20 automated tests in `src/__tests__/` (10 logic tests + 10 security/e2e tests) running with 100% green status under Vitest.
- **Containerization & Kubernetes Delivery**: Hardened Alpine Linux multi-stage `Dockerfile` (non-root `1001`), Kubernetes deployment manifests (`deploy/k8s/`), and production Helm chart (`deploy/helm/intentidy/`).
- **Observability Stack**: Prometheus `/metrics` scraping, OpenTelemetry ingestion (`/api/telemetry/ingest`), aggregate stats (`/api/telemetry/stats`), and health check probes (`/api/health`).
