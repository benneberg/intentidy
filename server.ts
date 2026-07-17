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
