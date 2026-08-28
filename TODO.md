# TODO — intenTidy Production Roadmap

This roadmap outlines active and upcoming tasks to extend intenTidy's production capabilities for multi-tenant and enterprise cloud deployments. All prior baseline security, persistence, observability, and test suite tasks have been completed and verified.

---

## 1. Authentication & Multi-Tenant Access Control (RBAC)
- [ ] **[JWT / OAuth Session Layer]**
  - Implement token-based authentication on `server.ts` (`Authorization: Bearer <token>`) so team members only access systems they own or are assigned to.
  - Add role-based permissions (`viewer`, `operator`, `owner`) to `PortableCard` entities.
- [ ] **[Team Workspace Scoping]**
  - Partition `/data/cards.json` storage by organization/workspace ID to allow isolated multi-tenant data structures.

---

## 2. Security & Webhook Hardening
- [ ] **[HMAC Webhook Verification]**
  - Implement cryptographic verification (`X-Hub-Signature-256`) on `/api/webhooks/github` payloads using a configurable secret key (`GITHUB_WEBHOOK_SECRET`).
  - Add rate-limiting middleware (`express-rate-limit`) on public API routes and AI proxies to protect against brute-force or denial-of-service attempts.

---

## 3. End-to-End Integration & Real-Time Sync
- [ ] **[Playwright E2E Automation]**
  - Add browser integration tests simulating the end-to-end user journey: card creation -> voice dictation -> topology linking -> deployment trigger.
- [ ] **[WebSocket / Server-Sent Events (SSE)]**
  - Upgrade client-server synchronization from REST polling to a lightweight SSE channel for live, collaborative cross-device updates when multiple engineers view the dashboard.

---

## 4. Cloud Infrastructure & DevOps
- [ ] **[Multi-Stage Dockerfile & Container Optimization]**
  - Provide a standardized, minimal Alpine-based `Dockerfile` with multi-stage build caching for rapid production deployments.
- [ ] **[Kubernetes / Helm Manifests]**
  - Add Helm chart templates and Kubernetes deployment manifests with automated health probes (`/api/health`, `/metrics`).
