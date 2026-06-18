# PURPOSE.md: intenTidy

## PRODUCT SUMMARY
intenTidy is a **semantic orchestration dashboard** designed for mobile-first software management. It abstracts complex repositories into "PortableCards"—visual and cognitive snapshots that provide architectural overviews, telemetry monitoring (simulated), and AI-powered summaries. The system aims to provide a "high-fidelity command center" for developers to track project health and intent without needing a full IDE environment.

## PROBLEM STATEMENT
**[Confidence: High]**
Developers frequently manage multiple simultaneous projects and struggle with "context drift" when away from their primary workstation. Traditional mobile git clients or CI/CD dashboards focus on raw files or build logs, which are difficult to parse on small screens. intenTidy solves this by providing a high-level, semantic abstraction of project state, allowing for rapid status checks and "intent-driven" updates.

## TARGET AUDIENCE
**[Confidence: High]**
- **Lead Developers / Architects**: Who need to maintain a "bird's eye view" of multiple subsystems and their health.
- **Engineering Managers**: Who require high-level status reports and semantic summaries of recent changes without diving into code.
- **SRE / DevOps Engineers**: Interested in monitoring deployment trends and error logs on the go (currently simulated).

**[Confidence: Medium]**
- **Technical Users**: The interface assumes familiarity with concepts like "Diffs," "Build Status," "Telemetry," and "Semantic Snapshots." It is not intended for non-technical stakeholders.

## VALUE PROPOSITION
- **Cognitive Compression**: Uses Gemini AI to turn thousands of lines of code into a single "Capability Map" or "Architecture Overview."
- **High-Fidelity Mobile UX**: Utilizes advanced animations (`motion/react`) to make complex data density manageable on mobile devices.
- **State Portability**: Conceptualizes "PortableCards" as self-contained entities that can be exported (JSON) or synced (currently simulated via `localStorage`).

## CORE FEATURES

### Verified (Exists in Code)
- **Advanced Filtering/Search**: Multi-tag selection and real-time inventory searching.
- **AI-Powered Summarization**: Integration with Gemini Pro to generate architecture overviews and capabililty analysis from repo descriptions.
- **Interactive Card System**: Expandable card views with dedicated tabs for Overview, Diff Review, and System Logs.
- **Simulated Telemetry**: Real-time jitter animation on latency charts to demonstrate the monitoring concept.
- **LocalStorage Persistence**: Basic saving and loading of the "Inventory" state across sessions.

### Inferred (Low/Medium Confidence)
- **Real-Time Webhook Support**: Simulated GitHub webhook listener implies an intended move toward server-authoritative push notifications.
- **Voice-to-Intent**: A microphone interface suggests a plan for voice-controlled project management, though currently it is a visual stub.

### Future (From TODOs / Gaps)
- **Durable Persistence**: Transition from `localStorage` to Cloud SQL or Firestore.
- **Execution Proxy**: Moving AI logic to a secure backend to prevent API key exposure.
- **Real-Time Git Integration**: Replacing simulated diffs with Octokit/GitHub API calls.
