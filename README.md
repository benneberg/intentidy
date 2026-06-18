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

- **🛡️ Semantic Architecture Review**: Uses Gemini Pro to generate high-level capability maps and architecture overviews from repository descriptions.
- **🧠 Autonomous Insight Dashboard**: Monitor simulated real-time latency, error thresholds, and build statuses across multiple systems.
- **🔍 Mobile-First Diff Viewer**: Review semantic code changes optimized for small-screen cognition.
- **🎯 Goal & Intent Tracking**: Manage active development objectives and project tasks directly on each card.
- **⚡ Advanced Inventory**:
  - **Universal Search**: Fast, keyword-based system lookup.
  - **Tag Systems**: Multi-select tag filtering via a dedicated modal.
  - **Persistence**: Auto-sync state to `localStorage` for session continuity.
- **📋 System Logs**: Dedicated "Error Logs" tab for tracking historical build and deployment failures (simulated).

---

## 🛠️ Technology Stack

- **Framework**: React 18+ (Vite)
- **Styling**: Tailwind CSS
- **Animations**: `motion/react` (Framer Motion)
- **Intelligence**: Google Gemini API (@google/genai)
- **Icons**: Lucide React
- **Persistence**: Browser LocalStorage

---

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to the .env file
```

---

## ⚙️ Configuration

The application requires a **Google Gemini API Key** for semantic features.

1. Obtain a key from [Google AI Studio](https://aistudio.google.com/).
2. Add it to your `.env` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

> **Note**: In current development, this key is bundled into the client via Vite. For production, a server-side proxy is recommended.

---

## 🚀 Usage

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

---

## 🧪 Testing

The project is currently in a **Prototype/H-Fi Design** phase. Automated test coverage is planned for Phase 2. To run the linter:

```bash
npm run lint
```

---

## 🏗️ Architecture

intenTidy is a client-side SPA.
- **Global State**: Managed in `App.tsx` via standard React hooks.
- **AI Integration**: Logic resides in `src/services/gemini.ts`.
- **UI Components**: Modular components located in `src/components/`, with `CardView.tsx` acting as the primary orchestration interface.

For a detailed breakdown, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

*Persist project intelligence. Orchestrate outcomes.*
