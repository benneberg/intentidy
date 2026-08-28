# intenTidy

**Orchestration Intelligence for Autonomous Software Entities.**

intenTidy is a semantic mobile orchestration layer designed to bridge the gap between heavy execution environments (IDEs) and mobile-first software management. It conceptualizes software systems as "PortableCards"—lightweight, AI-enhanced snapshots that provide architectural awareness and telemetry insights.

---

## 🚀 Overview

Traditional mobile git clients struggle by trying to squeeze desktop complexity into small screens. **intenTidy** inverts this by assuming mobile interaction is semantic, fragmented, and intent-driven. It focuses on *intent* rather than just *implementation*.

- **Repository -> Card**: A repository is the implementation; a card is the cognitive snapshot.
- **Semantic Navigation**: Move through code via features and behaviors rather than just raw files.
- **Orchestration**: The phone becomes the continuity layer for software project health.

---

## ✨ Features

- **🛡️ Secure Semantic Architecture Review**: Uses Gemini 2.5 Flash via a secure Backend-for-Frontend (BFF) Express proxy to generate high-level capability maps and architecture overviews from repository descriptions. No client-side key leakage!
- **🎙️ Agentic Voice-to-Intent**: Dictate goals, tasks, blockers, or deployment triggers in natural language. Speech is captured via the Web Speech API and parsed by Gemini into structured executable operations with one-click application.
- **🌐 Cross-System Topology Mapping (MultiView)**: An interactive bird's-eye topology view mapping dependencies, data pipelines, and shared libraries across multiple PortableCards.
- **📊 Real Observability & Metrics Scraper**: 
  - OpenTelemetry / Prometheus metric ingestion endpoint (`POST /api/telemetry/ingest`).
  - System health aggregates (`GET /api/telemetry/stats`).
  - Standard Prometheus scraping endpoint (`GET /metrics`) ready for Grafana and Prometheus monitoring stacks.
- **🛡️ 100% Uptime Fallback Heuristic Engine**: Resilient multi-tier architecture with rule-based heuristic engines for architecture reviews, maintenance suggestions, project summaries, and speech parsing, guaranteeing zero disruption during API rate limits or offline scenarios.
- **⚡ Memoized Performance & Non-Blocking UI**:
  - `CardView` memoized using `React.memo` for isolated render cycles.
  - Zero browser-blocking dialogs (`alert()`), replaced with fluid reactive modals (`Inventory Intelligence`, `VoiceAgentModal`).
  - UI telemetry jitter decoupled from disk persistence to eliminate write-back storms.
- **🔗 GitHub & Git API Proxy**: Inspect live repository metadata, branch commits, and diffs via backend proxy endpoints (`/api/git/*`).
- **🚀 Real-Time Deployment & Webhooks**: Ingress point for GitHub CI/CD webhooks (`/api/webhooks/github`) and deployment trigger endpoints (`/api/deployments/trigger`) with live status feedback.
- **🧠 Autonomous Insight Dashboard**: Monitor real-time latency, error thresholds, and build statuses across multiple systems, persistent and portable.
- **🔍 Mobile-First Diff Viewer**: Review semantic code changes optimized for small-screen cognition.
- **🎯 Goal & Intent Tracking**: Manage active development objectives and project tasks directly on each card.
- **⚡ Advanced Inventory**:
  - **Universal Search**: Fast, keyword-based system lookup.
  - **Tag Systems**: Multi-select tag filtering via a dedicated modal.
  - **Durable Server-Side Persistence**: Fully synced state persisted on a server-side JSON database (`data/cards.json`) for authentic cross-device portability.
- **📋 System Logs**: Dedicated "Error Logs" tab for tracking historical build and deployment failures.

---

## 🔌 API Architecture & Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/cards` | `GET` | Retrieve all active PortableCards from persistent store |
| `/api/cards` | `POST` | Create or update a PortableCard entity with atomic write |
| `/api/cards/:id` | `DELETE` | Remove a card from persistent storage |
| `/api/gemini/suggestions` | `POST` | Autonomous maintenance action generation with heuristic fallback |
| `/api/gemini/summarize` | `POST` | Single-sentence semantic context summarization |
| `/api/gemini/architecture` | `POST` | Deep architectural and subsystem analysis |
| `/api/gemini/parse-intent` | `POST` | Agentic natural language voice command parsing |
| `/api/telemetry/ingest` | `POST` | Ingest OpenTelemetry/Prometheus metrics from external agents |
| `/api/telemetry/stats` | `GET` | Aggregate latency, error spikes, and build health metrics |
| `/metrics` | `GET` | Standard plaintext Prometheus metrics scraper endpoint |
| `/api/git/repo-info` | `GET` | Proxy repository metadata, branches, and commit status |
| `/api/git/diffs` | `GET` | Retrieve structured file diffs for semantic review |
| `/api/git/sync/:id` | `POST` | Trigger repository synchronization snapshot |
| `/api/deployments/trigger` | `POST` | Trigger production build and deployment pipeline |
| `/api/webhooks/github` | `POST` | Ingress for CI/CD webhook event payloads |

---

## 🛠️ Technology Stack

- **Frontend**: React 19 & Vite 6 (ESM) styled with Tailwind CSS v4
- **Backend**: Express Server (Node.js) handling proxy endpoints and DB persistence
- **Animations**: `motion/react` (Motion v12)
- **Intelligence**: Google Gemini 2.5 Flash via a secure backend Express server (`@google/genai`)
- **Icons**: Lucide React
- **Persistence**: Durable Server-Side Database (`data/cards.json`)
- **Observability**: Prometheus `/metrics` + OpenTelemetry ingestion
- **Testing**: Vitest unit test suite (100% passing)

---

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

---

## ⚙️ Configuration

The application requires a **Google Gemini API Key** for semantic features.

1. Obtain a key from [Google AI Studio](https://aistudio.google.com/).
2. Add it to your `.env` file (never commit actual secrets):
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

---

## 🚀 Usage

### Development (Express + Vite Proxy)
To start the development server running on port `3000`:
```bash
npm run dev
```

### Build & Package (Production)
Compiles both the React client app and the Express server into a production-ready standalone bundle inside `/dist`:
```bash
npm run build
```

### Production Run
Starts the packaged CommonJS standalone bundle:
```bash
npm run start
```

---

## 🧪 Testing

We use Vitest to run our core logic unit tests. To execute the automated tests:

```bash
npm run test
```

To run the static linter:

```bash
npm run lint
```

---

## 🏗️ Architecture

intenTidy utilizes a **Hybrid Full-Stack Architecture**:
- **React Client**: Highly responsive UI managing state and user actions.
- **BFF Express Server**: Prevents client-side key leakage by serving as a secure gateway for Gemini API commands and handles persistence for cards dynamically.

For a detailed breakdown, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

*Persist project intelligence. Orchestrate outcomes.*
