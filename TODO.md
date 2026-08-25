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

- [x] **[src/services/git.ts]** Implement real GitHub API integration (Octokit/REST proxy) for branch/diff views.  
  *(Completed: Implemented server-side `/api/git/*` proxy endpoints supporting repository metadata retrieval, commit diff retrieval, and branch synchronization via `src/services/git.ts`).*
- [x] **[src/components/CardView.tsx]** Connect real Webhook and Deployment endpoints for "Deployment Awareness."  
  *(Completed: Integrated `/api/webhooks/github` and `/api/deployments/trigger` endpoints to track live deployment events and update card build statuses directly).*

# Phase 4 — Future Enhancements

- [x] **[src/services/audio.ts & VoiceIntentModal]** Implement LLM-based intent parsing for Voice-to-Intent (Agentic interpretation).  
  *(Completed: Built `VoiceIntentController` with Web Speech API speech-to-text, connected to `/api/gemini/parse-intent` powered by Gemini 2.5 Flash, providing structured intent parsing into tasks, goals, blockers, and deployments with 1-click execution).*
- [x] **[src/components/MultiView.tsx]** Create a bird's eye view for cross-card dependency mapping.  
  *(Completed: Built `MultiView.tsx` with interactive SVG dependency topology, dependency link creation, subsystem grouping, health metrics, and seamless integration with the main dashboard).*
