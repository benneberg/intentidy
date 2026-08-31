# Security Policy

## Reporting Security Vulnerabilities

We take the security of intenTidy seriously. If you discover a vulnerability or potential security weakness, please report it privately rather than opening a public issue.

- **Email**: security@intentidy.io (or via the project maintainer email in repository settings)
- **Response Time**: We aim to acknowledge reports within 48 hours and provide a resolution timeline within 5 business days.
- **Coordination**: Please provide detailed steps to reproduce the vulnerability and allow time for remediation prior to public disclosure.

---

## Supported Versions

Only the latest active release on the primary branch receives security patches:

| Version | Supported | Status |
| :--- | :---: | :--- |
| Primary / Latest | Yes | Supported with active security fixes |
| Historical / Archive | No | Unsupported |

---

## Security Architecture & Invariants

intenTidy implements defense-in-depth across the application lifecycle:

### 1. Secret Isolation & Zero Client-Side Exposure
- **Server-Only Secrets**: Sensitive keys (`GEMINI_API_KEY`, `JWT_SECRET`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_TOKEN`) are strictly read by the Node.js Express server (`server.ts`) from environment variables.
- **Client Bundle Protection**: Vite client configurations never expose backend API keys or secrets to the browser.
- **Backend-for-Frontend (BFF)**: All interactions with external intelligence or Git APIs are proxied through server endpoints (`/api/gemini/*`, `/api/git/*`). The client makes credential-free or session-authenticated requests directly to the local backend.

### 2. Authentication & Session Security
- **HMAC-SHA256 JWT Tokens**: Session authentication utilizes signed JSON Web Tokens (`HS256`).
- **Token Verification**: Handled server-side by `authMiddleware`. Tampered payloads, invalid signatures, or expired tokens are rejected with HTTP 401.
- **Stateless Bearer Sessions**: The client passes the token via standard `Authorization: Bearer <token>` HTTP headers.

### 3. Role-Based Access Control (RBAC)
Endpoints enforce a strict role hierarchy via `requireRole` middleware:

| Role | Scope | Permitted Actions |
| :--- | :--- | :--- |
| `viewer` | Read-only | View cards, inspect telemetry, list workspaces, stream SSE events |
| `operator` | Read-write | Create/update cards, run AI analysis, trigger deployments, sync git, create workspaces |
| `owner` | Administrative | Full rights, including card deletion (`DELETE /api/cards/:id`) |

Unauthorized requests receive HTTP 403 Forbidden.

### 4. Ingress Webhook Verification
- Incoming GitHub webhooks (`POST /api/webhooks/github`) are validated using `X-Hub-Signature-256`.
- Signatures are computed using HMAC-SHA256 with `GITHUB_WEBHOOK_SECRET` and evaluated using constant-time comparison (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.
- If `GITHUB_WEBHOOK_SECRET` is configured, requests lacking valid signatures are immediately rejected with HTTP 401.

### 5. Denial-of-Service (DoS) Mitigation
- An in-memory sliding-window rate limiter tracks requests per client IP over a 60-second window (default limit: 120 requests/minute, configurable via `RATE_LIMIT_MAX_REQUESTS`).
- Standard RFC rate-limiting headers are emitted:
  - `RateLimit-Limit`
  - `RateLimit-Remaining`
  - `RateLimit-Reset`
- Requests exceeding the limit receive HTTP 429 (`Too Many Requests`) with retry guidance.
- Critical internal pathways (`/api/health`, `/metrics`, `/api/events`, Vite dev assets) are exempted to preserve monitoring and real-time connectivity.

### 6. Multi-Tenant Data Isolation
- State is stored in isolated JSON files partitioned by workspace ID (`/data/workspaces/<workspaceId>/cards.json`).
- Path traversal is prevented by sanitizing workspace identifiers. Operations in one workspace cannot read or mutate data belonging to another partition.

### 7. Container & Runtime Hardening
- Production containers use a multi-stage Docker build based on Alpine Linux.
- The service executes under an unprivileged user (`uid 1001: intentidy`) rather than root.
- Minimal runtime dependencies reduce the vulnerability surface area.
