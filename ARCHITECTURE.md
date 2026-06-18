# ARCHITECTURE.md: intenTidy

## HIGH-LEVEL ARCHITECTURE
intenTidy follows a **Client-Side SPA (Single Page Application)** architecture. It is built as a highly interactive, state-heavy dashboard where the frontend acts as the primary source of logic for both orchestration and visualization.

**[Confidence: High]**

## COMPONENT BREAKDOWN
- **`App.tsx` (The Controller)**: 
  - Manages the global `cards` array state.
  - Implements the primary telemetry simulation loops (`setInterval`).
  - Handles persistence synchronization with `localStorage`.
  - Coordinates global UI states like the `FilterModal`, `InfoModal`, and Inventory Search.
- **`CardView.tsx` (The Organism)**:
  - Encapsulates the logic for an individual "PortableCard."
  - Manages internal navigation between "Architecture Overview" and "System Logs."
  - Implements simulated GitHub webhook listeners.
  - Handles local edit-mode state for card metadata.
- **`services/gemini.ts` (Intelligence Layer)**:
  - Wraps the `@google/genai` SDK.
  - Contains the system prompts used to transform repo strings into semantic capability maps and architecture snapshots.

## DATA FLOW
**[Confidence: High]**
1. **Source of Truth**: The primary source of truth is the `cards` state in `App.tsx`, which is initialized from `constants.ts` and hydrated from `localStorage`.
2. **State Management**: Uses standard React `useState` and `useEffect` hooks. There is no external state management library (like Redux or Zustand) currently in use.
3. **Telemetry Flow**: A central `setInterval` in `App.tsx` iterates over all cards and applies random jitter to latency values, triggering a global re-render to update Sparkline visualizations.

## EXTERNAL INTEGRATIONS
- **Google Gemini API**: Used for all "Semantic Analysis" features. The API key is currently injected into the client bundle at build-time.
- **GitHub Webhooks (Simulated)**: The code contains logic to simulate incoming pushes, intended to eventually be mapped to real GitHub Webhook ingress points.

## DEPLOYMENT MODEL
**[Confidence: High]**
- **Runtime**: Node.js environment serving a static bundle.
- **Build System**: Vite 6.0.
- **Target Platform**: Cloud Run (as evidenced by the `.run.app` URLs in metadata).
- **Environment Handling**: Uses `.env` for secrets like `GEMINI_API_KEY`, but these are incorrectly leaked into the frontend via Vite's `define` config.

## OBSERVABILITY MODEL
The observability model is currently **Simulated High-Fidelity**.
- Latency history is stored as an array of timestamped values.
- Error logs are stored as structured JSON objects within the card metadata.
- Build statuses are represented as an enum: `success` | `failure` | `pending`.

## ARCHITECTURAL RISKS
1. **Security Vulnerability**: The client-side exposure of the Gemini API key.
2. **Performance Bottleneck**: Global re-renders on telemetry updates will scale poorly as the number of cards increases.
3. **Data Fragility**: Reliance on `localStorage` leads to high data loss risk and lacks true multi-device "portability" (requires manual move of browser data).

## RECOMMENDED IMPROVEMENTS
1. **BFF (Backend-for-Frontend)**: Implement an Express server to proxy Gemini requests and handle real GitHub Webhook authentication.
2. **Atomic States**: Use a library like `Jotai` or `Zustand` to update telemetry data without re-rendering the entire inventory list.
3. **Durable Storage**: Transition to Firestore or a similar DB to enable the promised "PortableCards" cross-device continuity.
