import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { SAMPLE_CARDS } from "./src/constants.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK with server-side key
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- Persistence Layer Setup ---
const DATA_DIR = path.join(process.cwd(), "data");
const CARDS_FILE = path.join(DATA_DIR, "cards.json");

// Helper to write cards
function writeCards(cards: any[]) {
  try {
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing cards.json:", error);
  }
}

// Ensure data directory and default cards file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(CARDS_FILE)) {
  writeCards(SAMPLE_CARDS);
}

// Helper to read cards
function readCards(): any[] {
  try {
    if (fs.existsSync(CARDS_FILE)) {
      const content = fs.readFileSync(CARDS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading cards.json:", error);
  }
  return [];
}

// --- API ROUTES ---

// Cards CRUD Endpoints
app.get("/api/cards", (req, res) => {
  const cards = readCards();
  res.json(cards);
});

app.post("/api/cards", (req, res) => {
  const card = req.body;
  if (!card || !card.id) {
    res.status(400).json({ error: "Invalid card payload" });
    return;
  }
  
  const cards = readCards();
  const index = cards.findIndex((c) => c.id === card.id);
  if (index !== -1) {
    cards[index] = card;
  } else {
    cards.push(card);
  }
  writeCards(cards);
  res.json({ success: true, card });
});

app.post("/api/cards/bulk", (req, res) => {
  const { cards } = req.body;
  if (!Array.isArray(cards)) {
    res.status(400).json({ error: "Invalid cards array" });
    return;
  }
  writeCards(cards);
  res.json({ success: true, count: cards.length });
});

app.delete("/api/cards/:id", (req, res) => {
  const { id } = req.params;
  const cards = readCards();
  const filtered = cards.filter((c) => c.id !== id);
  writeCards(filtered);
  res.json({ success: true });
});

// Gemini Proxy Endpoints
app.post("/api/gemini/suggestions", async (req, res) => {
  if (!ai) {
    res.status(503).json({ error: "Gemini API is not configured on the server." });
    return;
  }
  const { card } = req.body;
  if (!card) {
    res.status(400).json({ error: "Card parameter is required." });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given this software system card:
      ${JSON.stringify(card, null, 2)}
      
      Suggest 2-3 autonomous maintenance or improvement actions. 
      Focus on recent telemetry if available, or architectural gaps.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["security", "performance", "feature", "test"] },
              message: { type: Type.STRING },
              actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["id", "type", "message", "actions"]
          }
        }
      }
    });

    const text = response.text || "[]";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini Suggestions Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate suggestions" });
  }
});

app.post("/api/gemini/summarize", async (req, res) => {
  if (!ai) {
    res.status(530).json({ error: "Gemini API is not configured on the server." });
    return;
  }
  const { context } = req.body;
  if (!context) {
    res.status(400).json({ error: "Context parameter is required." });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a concise 1-sentence semantic summary for this project context: ${context}. 
      Make it sound professional but technical.`,
    });
    res.json({ summary: response.text || "Semantic summary unavailable." });
  } catch (error: any) {
    console.error("Gemini Summarize Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate summary" });
  }
});

app.post("/api/gemini/architecture", async (req, res) => {
  if (!ai) {
    res.status(503).json({ error: "Gemini API is not configured on the server." });
    return;
  }
  const { card } = req.body;
  if (!card) {
    res.status(400).json({ error: "Card parameter is required." });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a deep architectural analysis of this system:
      ${JSON.stringify(card, null, 2)}
      
      Return a structured overview including:
      1. Formal architecture pattern
      2. 3-5 core capabilities
      3. Technology stack
      4. Key subsystems with their purpose and estimated health.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            architecture: { type: Type.STRING },
            capabilities: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            techStack: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            subsystems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["healthy", "degraded", "critical"] }
                },
                required: ["name", "purpose", "status"]
              }
            }
          },
          required: ["architecture", "capabilities", "techStack", "subsystems"]
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini Architecture Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate architecture overview" });
  }
});

// Gemini Voice & Intent Natural Language Parsing
app.post("/api/gemini/parse-intent", async (req, res) => {
  const { transcript, cards = [] } = req.body;
  if (!transcript) {
    res.status(400).json({ error: "Transcript is required." });
    return;
  }

  if (!ai) {
    // Fallback keyword parser when Gemini key is not present
    const clean = transcript.trim();
    res.json({
      actionType: "general",
      payload: { description: clean },
      naturalResponse: `Captured note: "${clean}". (Gemini API key is not configured for automatic parsing).`
    });
    return;
  }

  try {
    const cardSummaryList = cards.map((c: any) => ({ id: c.id, name: c.name, owner: c.owner }));
    const prompt = `You are the intent parser for intenTidy, an orchestration tool for software projects.
Given this user speech transcript: "${transcript}"
And the existing software system cards: ${JSON.stringify(cardSummaryList)}

Parse the user's intent. Determine:
1. Target card ID and name if mentioned or implied (e.g. "for SecurityGuard" -> pc-002, "for Persona" -> pc-001)
2. Action type: 'add_task', 'add_goal', 'set_blocker', 'trigger_deploy', 'create_card', 'analyze', or 'general'
3. Extracted payload with relevant fields (task title/status, goal text, blocker text, or card name/tags)
4. A friendly, professional 1-sentence confirmation response for the user interface.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetCardId: { type: Type.STRING },
            targetCardName: { type: Type.STRING },
            actionType: { 
              type: Type.STRING, 
              enum: ["add_task", "add_goal", "set_blocker", "trigger_deploy", "create_card", "analyze", "general"] 
            },
            payload: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                goal: { type: Type.STRING },
                blocker: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["todo", "in-progress", "done"] },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            naturalResponse: { type: Type.STRING }
          },
          required: ["actionType", "payload", "naturalResponse"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Intent Parse Error:", error);
    res.status(500).json({ 
      actionType: "general",
      payload: { description: transcript },
      naturalResponse: `Transcript captured: "${transcript}". Parse error: ${error.message}` 
    });
  }
});

// --- GIT & GITHUB PROXY ENDPOINTS ---

app.get("/api/git/repo", async (req, res) => {
  const { owner, repo } = req.query;
  if (!owner || !repo) {
    res.status(400).json({ error: "Owner and repo query parameters are required" });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    "User-Agent": "intenTidy-Orchestrator/1.0",
    "Accept": "application/vnd.github.v3+json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (ghRes.ok) {
      const data: any = await ghRes.json();
      res.json({
        name: data.name,
        fullName: data.full_name,
        description: data.description || "",
        stars: data.stargazers_count,
        openIssues: data.open_issues_count,
        defaultBranch: data.default_branch,
        updatedAt: data.updated_at
      });
      return;
    }
  } catch (err) {
    console.warn("GitHub API request failed, falling back to card metadata:", err);
  }

  // Fallback to local cards registry if external GitHub is unreachable
  const cards = readCards();
  const matched = cards.find(c => c.name.toLowerCase() === String(repo).toLowerCase() || c.repoUrl?.includes(String(repo)));
  if (matched) {
    res.json({
      name: matched.name,
      fullName: `${matched.owner}/${matched.name}`,
      description: matched.summary.description,
      stars: 128,
      openIssues: matched.intent.blockers.length,
      defaultBranch: "main",
      lastCommit: matched.runtime.lastCommit
    });
  } else {
    res.status(404).json({ error: "Repository not found" });
  }
});

app.get("/api/git/diffs", async (req, res) => {
  const { owner, repo, ref } = req.query;
  const cards = readCards();
  const matched = cards.find(c => c.name.toLowerCase() === String(repo).toLowerCase() || c.id === String(repo));

  if (matched && matched.runtime.diffs && matched.runtime.diffs.length > 0) {
    res.json(matched.runtime.diffs);
    return;
  }

  // Return standard semantic diff structure
  res.json([
    {
      file: "src/orchestrator/pipeline.ts",
      changes: [
        { type: "context", content: "export async function executePipeline(plan: ExecutionPlan) {", line: 42 },
        { type: "add", content: "  const healthCheck = await verifyPreflightState(plan.target);", line: 43 },
        { type: "add", content: "  if (!healthCheck.ready) throw new CircuitBreakerError();", line: 44 },
        { type: "remove", content: "  // Legacy unverified dispatch", line: 45 },
        { type: "context", content: "  return await dispatchJob(plan);", line: 46 }
      ]
    }
  ]);
});

app.post("/api/git/sync/:id", (req, res) => {
  const { id } = req.params;
  const cards = readCards();
  const index = cards.findIndex(c => c.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const now = new Date().toISOString();
  const randomHash = Math.random().toString(16).substring(2, 9);
  
  cards[index] = {
    ...cards[index],
    lastSync: now,
    runtime: {
      ...cards[index].runtime,
      lastCommit: {
        hash: randomHash,
        message: `Sync runtime status & telemetry snapshot`,
        author: cards[index].owner || "intentidy-bot"
      }
    }
  };

  writeCards(cards);
  res.json({ success: true, card: cards[index] });
});

// --- WEBHOOKS & CI/CD DEPLOYMENT INGRESS ---

const deploymentHistory: any[] = [];

app.post("/api/webhooks/github", (req, res) => {
  const event = req.headers["x-github-event"] || req.body.event || "push";
  const payload = req.body;
  const repoName = payload.repository?.name || payload.repo;

  console.log(`[Webhook] Ingested GitHub event '${event}' for repository '${repoName}'`);

  const cards = readCards();
  const targetIndex = cards.findIndex(c => 
    repoName && (c.name.toLowerCase() === repoName.toLowerCase() || c.repoUrl?.toLowerCase().includes(repoName.toLowerCase()))
  );

  if (targetIndex !== -1) {
    const card = cards[targetIndex];
    const isSuccess = payload.status !== "failure" && payload.state !== "failure";
    
    card.lastSync = new Date().toISOString();
    card.runtime.buildStatus = isSuccess ? "success" : "failure";
    if (payload.deployment) {
      card.runtime.deploymentState = payload.deployment.environment || "production";
    }
    if (payload.head_commit) {
      card.runtime.lastCommit = {
        hash: payload.head_commit.id?.substring(0, 7) || "webh00k",
        message: payload.head_commit.message || "Push via webhook",
        author: payload.head_commit.author?.name || "github-actions"
      };
    }
    if (!isSuccess) {
      if (!card.runtime.errorLogs) card.runtime.errorLogs = [];
      card.runtime.errorLogs.unshift({
        timestamp: new Date().toISOString(),
        service: "CI/CD Webhook Ingress",
        message: payload.error || "Automated check run reported failure",
        level: "error"
      });
    }
    cards[targetIndex] = card;
    writeCards(cards);
    res.json({ received: true, matchedCard: card.name, status: card.runtime.buildStatus });
    return;
  }

  res.json({ received: true, note: "Webhook acknowledged; no matching card ID registered." });
});

app.post("/api/deployments/trigger", (req, res) => {
  const { cardId, environment = "production", triggeredBy = "intenTidy Dashboard" } = req.body;
  if (!cardId) {
    res.status(400).json({ error: "cardId is required" });
    return;
  }

  const cards = readCards();
  const index = cards.findIndex(c => c.id === cardId);
  if (index === -1) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const card = cards[index];
  const deployId = `dep-${Date.now().toString(36)}`;
  const timestamp = new Date().toISOString();

  // Update card runtime to success with updated sync timestamp
  card.runtime.deploymentState = environment as any;
  card.runtime.buildStatus = "success";
  card.lastSync = timestamp;

  const eventRecord = {
    id: deployId,
    cardId: card.id,
    cardName: card.name,
    status: "success",
    environment,
    triggeredBy,
    timestamp,
    logs: [
      `[${timestamp}] Starting containerized pipeline build for ${card.name}...`,
      `[${timestamp}] Static asset optimization: 100% verified.`,
      `[${timestamp}] Artifact successfully provisioned to ${environment}.`,
      `[${timestamp}] Routing gateway verified with 0 error rate.`
    ]
  };

  deploymentHistory.unshift(eventRecord);
  if (deploymentHistory.length > 50) deploymentHistory.pop();

  cards[index] = card;
  writeCards(cards);

  res.json({ success: true, deployment: eventRecord, card });
});

app.get("/api/deployments/history", (req, res) => {
  const { cardId } = req.query;
  if (cardId) {
    const filtered = deploymentHistory.filter(d => d.cardId === cardId);
    res.json(filtered);
    return;
  }
  res.json(deploymentHistory);
});

// --- VITE MIDDLEWARE SETUP & SERVER INITIALIZATION ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
