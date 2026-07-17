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

- **🛡️ Secure Semantic Architecture Review**: Uses Gemini Pro via a secure Backend-for-Frontend (BFF) Express proxy to generate high-level capability maps and architecture overviews from repository descriptions. No client-side key leakage!
- **🧠 Autonomous Insight Dashboard**: Monitor real-time latency, error thresholds, and build statuses across multiple systems, persistent and portable.
- **🔍 Mobile-First Diff Viewer**: Review semantic code changes optimized for small-screen cognition.
- **🎯 Goal & Intent Tracking**: Manage active development objectives and project tasks directly on each card.
- **⚡ Advanced Inventory**:
  - **Universal Search**: Fast, keyword-based system lookup.
  - **Tag Systems**: Multi-select tag filtering via a dedicated modal.
  - **Durable Server-Side Persistence**: Fully synced state persisted on a server-side JSON database (`data/cards.json`) for authentic cross-device portability.
  - **Telemetry Isolation**: UI-only telemetry simulation keeps visual jitter smooth while isolating it from database operations, preventing DB write-back storms.
- **📋 System Logs**: Dedicated "Error Logs" tab for tracking historical build and deployment failures.

---

## 🛠️ Technology Stack

- **Frontend**: React 18+ (Vite) styled with Tailwind CSS
- **Backend**: Express Server (Node.js) handling proxy endpoints and DB persistence
- **Animations**: `motion/react` (Framer Motion)
- **Intelligence**: Google Gemini API via a secure backend Express server (`@google/genai`)
- **Icons**: Lucide React
- **Persistence**: File-based Server-Side Database (`data/cards.json`)
- **Testing**: Vitest unit test suite

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
