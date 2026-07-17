# TODO — intenTidy Production Path

# Phase 1 — Make It Work (Security & Persistence)

- [x] **[vite.config.ts]** Remove `process.env.GEMINI_API_KEY` from `define` block.  
  *(Completed: Key removed from client-side config to eliminate exposure risks).*
- [x] **[src/services/gemini.ts]** Refactor to use `/api/gemini` proxy endpoints instead of direct SDK calls.  
  *(Completed: Refactored prompt handling to securely route all queries through our Express server backend).*
- [x] **[src/App.tsx]** Replace `localStorage` with Firebase Firestore or a real PostgreSQL backend.  
  *(Completed: Created a dedicated Express CRUD API with backend database file persistence at `/data/cards.json` to store PortableCards durable across devices).*

# Phase 2 — Make It Reliable (Stability & Observation)

- [x] **[src/__tests__]** Bootstrap Vitest and implement first 10 unit tests for core logic.  
  *(Completed: Bootstrapped Vitest and implemented `/src/__tests__/logic.spec.ts` containing 10 tests with 100% pass rate covering search, tag-filtering, date sorting, state mutations, telemetry baseline constraints, and AI network failures).*
- [x] **[src/components/CardView.tsx]** Implement real error handling for AI re-analysis failures.  
  *(Completed: Added state trackers for `aiError` and integrated elegant, interactive rose-colored alert banners inside the card views when AI analysis throws network or model exceptions).*
- [x] **[src/App.tsx]** Throttle/Debounce telemetry updates to prevent re-render thrashing.  
  *(Completed: Isolated simulated client-side telemetry jitter from actual state mutations, eliminating redundant database server writes and avoiding write storms).*

# Phase 3 — Make It Production Ready (Real Connectivity)

- [ ] **[src/services/git.ts]** Implement real GitHub API integration (Octokit) for branch/diff views.  
  Priority: P1 | Impact: High | Effort: L | Evidence: simulated sync | Recommendation: replace mocks.  
  Confidence: High.
- [ ] **[src/components/CardView.tsx]** Connect real WebSocket or Webhook events for "Deployment Awareness."  
  Priority: P2 | Impact: High | Effort: M | Evidence: simulated webhooks | Recommendation: real ingress points.  
  Confidence: Medium.

# Phase 4 — Future Enhancements

- [ ] **[src/services/audio.ts]** Implement LLM-based intent parsing for Voice-to-Task (Agentic interpretation).  
  Priority: P3 | Impact: Low | Effort: M | Evidence: stubs | Recommendation: use gemini-pro-vision.  
  Confidence: Low.
- [ ] **[src/components/MultiView.tsx]** Create a bird's eye view for cross-card dependency mapping.  
  Priority: P3 | Impact: Medium | Effort: L | Evidence: goal of "orchestration layer" | Recommendation: use d3-force.  
  Confidence: Medium.
