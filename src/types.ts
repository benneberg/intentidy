/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PortableCard {
  id: string;
  name: string;
  owner: string;
  tags: string[];
  status: 'active' | 'archived' | 'experimental';
  lastSync: string;
  
  // References
  repoUrl?: string;
  deployUrl?: string;
  workspaceId?: string;

  // Semantic Layer
  summary: {
    architecture: string;
    capabilities: string[];
    techStack: string[];
    description: string;
  };

  // Runtime Layer
  runtime: {
    buildStatus: 'success' | 'failure' | 'pending';
    deploymentState: 'production' | 'staging' | 'dev' | 'offline';
    lastCommit: {
      hash: string;
      message: string;
      author: string;
    };
    diffs?: Diff[];
    telemetry?: {
      latency?: number;
      errors?: number;
      coverage?: number;
    };
  };

  // Intent Layer
  intent: {
    goals: string[];
    tasks: Task[];
    blockers: string[];
  };

  // Agent Layer (Autonomous)
  suggestions?: Suggestion[];
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
}

export interface Suggestion {
  id: string;
  type: 'security' | 'performance' | 'feature' | 'test';
  message: string;
  actions: string[];
}

export interface Diff {
  file: string;
  changes: {
    type: 'add' | 'remove' | 'modify';
    content: string;
    line?: number;
  }[];
}
