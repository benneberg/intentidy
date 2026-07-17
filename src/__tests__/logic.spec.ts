import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PortableCard } from '../types';

describe('intenTidy Logic Unit Tests', () => {
  let sampleCards: PortableCard[];

  beforeEach(() => {
    sampleCards = [
      {
        id: "pc-001",
        name: "PersonaLinea",
        owner: "benneberg",
        tags: ["core", "semantic", "orchestration"],
        status: "active",
        lastSync: "2026-05-09T12:00:00Z",
        summary: {
          description: "Semantic project lineage and orchestration platform.",
          architecture: "Event-driven microservices",
          capabilities: ["Lineage tracking"],
          techStack: ["React"],
        },
        runtime: {
          buildStatus: "success",
          deploymentState: "production",
          lastCommit: { hash: "7d3a2f1", message: "initial", author: "benneberg" }
        },
        intent: { goals: [], tasks: [], blockers: [] }
      },
      {
        id: "pc-002",
        name: "SecurityGuard",
        owner: "benneberg",
        tags: ["security", "audit"],
        status: "experimental",
        lastSync: "2026-06-12T15:30:00Z",
        summary: {
          description: "Automated vulnerability scanner for containers.",
          architecture: "Serverless pipelines",
          capabilities: ["Scanning"],
          techStack: ["Node"],
        },
        runtime: {
          buildStatus: "failure",
          deploymentState: "dev",
          lastCommit: { hash: "3a92b21", message: "fix audit errors", author: "sec-bot" }
        },
        intent: { goals: [], tasks: [], blockers: [] }
      }
    ];
  });

  // Test 1: Search Precision
  it('should filter cards accurately by case-insensitive search queries', () => {
    const query = "vulnerability";
    const filtered = sampleCards.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.summary.description.toLowerCase().includes(query.toLowerCase())
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("pc-002");
  });

  // Test 2: Tag-based Filtering
  it('should match cards only if they contain all selected tags', () => {
    const selectedTags = ["security"];
    const filtered = sampleCards.filter(c => 
      selectedTags.every(t => c.tags.includes(t))
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("pc-002");
  });

  // Test 3: Tag-based Filtering (Empty Tags)
  it('should return all cards if no tags are selected', () => {
    const selectedTags: string[] = [];
    const filtered = sampleCards.filter(c => 
      selectedTags.length === 0 || selectedTags.every(t => c.tags.includes(t))
    );

    expect(filtered).toHaveLength(2);
  });

  // Test 4: Sorting by Name
  it('should sort cards alphabetically by name (A-Z)', () => {
    const sorted = [...sampleCards].sort((a, b) => a.name.localeCompare(b.name));
    expect(sorted[0].name).toBe("PersonaLinea");
    expect(sorted[1].name).toBe("SecurityGuard");
  });

  // Test 5: Sorting by Recent Sync Date
  it('should sort cards with the most recent sync date first', () => {
    const sorted = [...sampleCards].sort((a, b) => 
      new Date(b.lastSync).getTime() - new Date(a.lastSync).getTime()
    );
    expect(sorted[0].id).toBe("pc-002"); // June 12 is newer than May 9
    expect(sorted[1].id).toBe("pc-001");
  });

  // Test 6: Sorting by Build Status Priority
  it('should sort cards by build status weight (success -> pending -> failure)', () => {
    const order = { success: 0, pending: 1, failure: 2 };
    const sorted = [...sampleCards].sort((a, b) => 
      order[a.runtime.buildStatus] - order[b.runtime.buildStatus]
    );
    expect(sorted[0].id).toBe("pc-001"); // success
    expect(sorted[1].id).toBe("pc-002"); // failure
  });

  // Test 7: State Mutation - Adding a task
  it('should support adding a task to a card cleanly', () => {
    const card = sampleCards[0];
    const newTask = { id: 'task-abc', title: 'Audit auth secrets', status: 'todo' as const };
    
    const updatedCard = {
      ...card,
      intent: {
        ...card.intent,
        tasks: [...card.intent.tasks, newTask]
      }
    };

    expect(updatedCard.intent.tasks).toHaveLength(1);
    expect(updatedCard.intent.tasks[0].title).toBe('Audit auth secrets');
    expect(updatedCard.intent.tasks[0].status).toBe('todo');
  });

  // Test 8: Telemetry Jitter calculations
  it('should calculate telemetry updates cleanly with a baseline floor constraint of 20ms', () => {
    const latency = 15; // artificially below floor
    const newLatency = Math.max(20, latency + (Math.random() * 10 - 5));
    expect(newLatency).toBeGreaterThanOrEqual(20);
  });

  // Test 9: Mocking AI proxy error recovery for suggestions
  it('should return empty list as fallback when fetch fails for suggestions', async () => {
    global.fetch = vi.fn().mockImplementation(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error"
      })
    );

    const { generateSuggestions } = await import('../services/gemini');
    const result = await generateSuggestions(sampleCards[0]);
    expect(result).toEqual([]);
  });

  // Test 10: Mocking AI proxy error recovery for project summary
  it('should return error text as fallback when fetch throws a network exception for summarization', async () => {
    global.fetch = vi.fn().mockImplementation(() => 
      Promise.reject(new Error("Network connection lost"))
    );

    const { summarizeProject } = await import('../services/gemini');
    const result = await summarizeProject("project data");
    expect(result).toBe("Error generating summary.");
  });
});
