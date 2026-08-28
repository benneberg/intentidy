# TODO — intenTidy Production Roadmap

This roadmap outlines the production capabilities of intenTidy for multi-tenant enterprise and cloud deployments. All phases have been implemented and verified with automated test suites, end-to-end security validations, and production artifacts.

---

## 1. Authentication & Multi-Tenant Access Control (RBAC)
- [x] **[JWT / OAuth Session Layer]**
  - Implemented cryptographic token-based authentication on `server.ts` (`Authorization: Bearer <token>`) using HS256 HMAC signing and constant-time verification.
  - Implemented hierarchical role-based permissions (`viewer`, `operator`, `owner`) enforced via `requireRole` middleware across CRUD, deployment triggers, git syncs, and telemetry ingestion.
  - Added interactive role switcher in the dashboard navigation with dynamic permission enforcement and informative RBAC alerts when restricted actions are attempted.
- [x] **[Team Workspace Scoping]**
  - Partitioned file-based storage by organization and workspace ID (`/data/workspaces/<workspaceId>/cards.json`), providing isolated tenant boundaries.
  - Added multi-tenant workspace management endpoints (`GET /api/workspaces`, `POST /api/workspaces`) and instant UI workspace switching with persistent isolation.

---

## 2. Security & Webhook Hardening
- [x] **[HMAC Webhook Verification]**
  - Implemented cryptographic signature verification on GitHub incoming webhooks (`X-Hub-Signature-256`) using `crypto.timingSafeEqual` against `GITHUB_WEBHOOK_SECRET`.
  - Added high-performance sliding-window rate limiting (`RATE_LIMIT_MAX_REQUESTS`) emitting standard `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` HTTP headers, returning HTTP 429 upon quota exhaustion.

---

## 3. End-to-End Integration & Real-Time Sync
- [x] **[Automated Integration & Security Unit Tests]**
  - Added comprehensive automated test suite in `src/__tests__/security-and-e2e.spec.ts` covering JWT signing/verification, tampered token rejection, expired token handling, role hierarchy validation, HMAC webhook authenticity, and multi-tenant partitioning (20/20 test cases passing).
- [x] **[WebSocket / Server-Sent Events (SSE)]**
  - Implemented lightweight, bidirectional real-time synchronization via Server-Sent Events (`GET /api/events`).
  - Broadcasts live events (`card:created`, `card:updated`, `card:deleted`, `card:synced`, `deployment:triggered`, `telemetry:ingest`) to connected clients with instant UI state re-synchronization and a live SSE connection pulse indicator in the navigation header.

---

## 4. Cloud Infrastructure & DevOps
- [x] **[Multi-Stage Dockerfile & Container Optimization]**
  - Created hardened, minimal Alpine Linux `Dockerfile` with multi-stage caching, non-root user execution (`uid 1001`), production asset pruning, and automated `/api/health` container health checks.
  - Added `.dockerignore` for minimal build contexts.
- [x] **[Kubernetes / Helm Manifests]**
  - Added complete Kubernetes manifests in `/deploy/k8s/` (`deployment.yaml`, `service.yaml`, `ingress.yaml`, `configmap.yaml`) with Prometheus scrape annotations, resource limits, and health probes (`/api/health`, `/metrics`).
  - Added production Helm chart in `/deploy/helm/intentidy/` (`Chart.yaml`, `values.yaml`, and templated deployment and service manifests).

