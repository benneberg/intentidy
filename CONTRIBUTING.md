# Contributing to intenTidy

Thank you for contributing to intenTidy! This guide covers the local development setup, coding standards, testing workflows, and submission guidelines.

---

## Prerequisites

- **Node.js**: v20.x or v22.x (LTS recommended)
- **npm** or **bun**: Package management and script execution
- **Git**: Version control

---

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd intentidy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to supply development credentials:
   - `GEMINI_API_KEY`: Required for real AI analysis and intent parsing. (Fallback heuristics handle requests when unset.)
   - `JWT_SECRET`: Secret key for HS256 JWT session tokens.
   - `GITHUB_WEBHOOK_SECRET`: Optional secret for testing GitHub webhook signatures.
   - `RATE_LIMIT_MAX_REQUESTS`: Default 120 requests/minute.

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`. In development, Express mounts Vite as middleware, providing rapid hot-reloading for the client while serving API routes directly.

---

## Verification & Quality Checks

Always verify your changes before committing:

### 1. Automated Tests
Run the Vitest test suite:
```bash
npm test
```
The test suite covers:
- Core logic, sorting, filtering, and tag search (`src/__tests__/logic.spec.ts`)
- Cryptographic JWT signing, tamper rejection, expired tokens, RBAC hierarchy, HMAC webhook verification, rate limiting, and workspace tenant isolation (`src/__tests__/security-and-e2e.spec.ts`)

All tests must pass green before submitting changes.

### 2. Static Type Checking
Verify TypeScript types without emitting artifacts:
```bash
npm run lint
```

### 3. Production Build Verification
Ensure the full-stack build compiles cleanly:
```bash
npm run build
```
This builds the client assets to `dist/` and bundles `server.ts` into `dist/server.cjs` via `esbuild`.

To test the production build locally:
```bash
npm run start
```

---

## Core Architectural Guidelines

When contributing code, adhere strictly to these architectural invariants:

1. **Zero Client Secrets**:
   - Never expose API keys or secrets in client-side code (`src/`).
   - All interactions with third-party APIs (Gemini, GitHub) must run through backend endpoints in `server.ts`.
2. **Deterministic Fallbacks**:
   - External AI API calls must be wrapped in try/catch blocks that fall back to local heuristic engines so the application remains functional even during rate limits or external outages.
3. **Multi-Tenant State Isolation**:
   - Any state mutation must be scoped to the active workspace (`/data/workspaces/<workspaceId>/cards.json`).
4. **Non-Blocking UI**:
   - Avoid synchronous browser dialogs (`window.alert`, `window.prompt`). Use accessible modal components or toast alerts.
5. **Real-Time Push Synchronization**:
   - State mutations should broadcast events via `broadcastRealtimeEvent` on Server-Sent Events (`/api/events`) to keep multi-tab sessions in sync.

---

## Pull Request Workflow

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feature/my-feature-name
   ```
2. Implement your changes following existing formatting and conventions.
3. Add or update tests in `src/__tests__/` to cover new behavior or fixed bugs.
4. Run `npm test`, `npm run lint`, and `npm run build` to confirm everything succeeds.
5. Submit a pull request with a clear description of the problem solved and the implementation approach.
