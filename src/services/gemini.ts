/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortableCard, Suggestion } from "../types";

export async function generateSuggestions(card: PortableCard): Promise<Suggestion[]> {
  try {
    const response = await fetch("/api/gemini/suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ card }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating suggestions via proxy:", error);
    return [];
  }
}

export async function summarizeProject(context: string): Promise<string> {
  try {
    const response = await fetch("/api/gemini/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ context }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.summary || "Semantic summary unavailable.";
  } catch (error) {
    console.error("Error summarizing project via proxy:", error);
    return "Error generating summary.";
  }
}

export async function generateArchitectureOverview(card: PortableCard): Promise<Partial<PortableCard['summary']>> {
  try {
    const response = await fetch("/api/gemini/architecture", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ card }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating architecture overview via proxy:", error);
    return {};
  }
}
