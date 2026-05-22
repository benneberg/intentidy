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
    subsystems?: Subsystem[];
  };

  // Runtime Layer
  runtime: {
    buildStatus: 'success' | 'failure' | 'pending';
    deploymentState: 'production' | 'staging' | 'dev' | 'offline';
    testResults?: {
      passed: number;
      failed: number;
      total: number;
      coverage: number;
      lastRun: string;
    };
    lastCommit: {
      hash: string;
      message: string;
      author: string;
    };
    diffs?: Diff[];
    errorLogs?: ErrorLog[];
    telemetry?: {
      latency?: number;
      latencyHistory?: { time: string; value: number }[];
      errors?: number;
      coverage?: number;
    };
  };

  // Continuity Layer
  continuity?: {
    lastActiveFile?: string;
    tabs: string[];
    cursorPosition?: { line: number; ch: number };
    activeDebugSession?: boolean;
    localEnvironmentState?: 'warm' | 'cold' | 'hibernated';
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

export interface Subsystem {
  name: string;
  purpose: string;
  status: 'healthy' | 'degraded' | 'critical';
}

export interface Diff {
  file: string;
  changes: {
    type: 'add' | 'remove' | 'modify';
    content: string;
    line?: number;
  }[];
}

export interface ErrorLog {
  timestamp: string;
  service: string;
  message: string;
  level: 'error' | 'warning';
}
