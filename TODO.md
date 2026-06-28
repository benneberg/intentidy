# TODO — intenTidy Production Path

# Phase 1 — Make It Work (Security & Persistence)

- [ ] **[vite.config.ts]** Remove `process.env.GEMINI_API_KEY` from `define` block.  
  Priority: P0 | Impact: High | Effort: S | Evidence: config leak | Recommendation: Move to server.  
  Confidence: High.
- [ ] **[src/services/gemini.ts]** Refactor to use `/api/gemini` proxy endpoints instead of direct SDK calls.  
  Priority: P0 | Impact: High | Effort: M | Evidence: security audit | Recommendation: Implement backend proxy.  
  Confidence: High.
- [ ] **[src/App.tsx]** Replace `localStorage` with Firebase Firestore or a real PostgreSQL backend.  
  Priority: P1 | Impact: High | Effort: L | Evidence: portability requirement | Recommendation: Use a cloud DB.  
  Confidence: High.

# Phase 2 — Make It Reliable (Stability & Observation)

- [ ] **[src/__tests__]** Bootstrap Vitest and implement first 10 unit tests for core logic.  
  Priority: P1 | Impact: Medium | Effort: M | Evidence: 0% coverage | Recommendation: standard TDD.  
  Confidence: High.
- [ ] **[src/components/CardView.tsx]** Implement real error handling for AI re-analysis failures.  
  Priority: P2 | Impact: Medium | Effort: S | Evidence: stubs | Recommendation: add try/catch UI states.  
  Confidence: Medium.
- [ ] **[src/App.tsx]** Throttle/Debounce telemetry updates to prevent re-render thrashing.  
  Priority: P2 | Impact: Medium | Effort: S | Evidence: 3s interval jitter | Recommendation: use useMemo/useCallback.  
  Confidence: High.

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

## Notes:
Create a 'feature card' that acts as a semi-autonomous agent. This card should include memory of past events, basic telemetry, and the ability to suggest actionable improvements or fixes for the feature it represents. Start with a simple 'Authentication Card' that monitors login attempts and suggests retry throttling.

Implement a feature that synchronizes project state, including open files, cursor position, and recent changes, between desktop and mobile devices. This will enable seamless project continuity across different platforms.
Integrate a mini sparkline chart using 'recharts' into the project card view to visualize the 'latency' telemetry data over time. Integrate an AI assistant to generate an architecture overview for the PortableCard. The overview should summarize the project's main subsystems, technology stack, and overall capabilities based on the connected repository's structure and code.

Implement a synchronization feature for PortableCards. The card should be able to connect to a specified Git repository, track recent commits, and allow users to initiate a sync to pull the latest changes to their local environment.
Develop an AI-powered summarization feature. Given a project's codebase or a specific subsystem, the AI should generate a concise overview of its purpose, architecture, and key functionalities. This summary should be lightweight and easily digestible on a mobile interface.
