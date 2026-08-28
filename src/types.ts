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

  // RBAC & Permissions
  rolePermissions?: {
    requiredRoleToEdit?: UserRole;
    requiredRoleToDeploy?: UserRole;
  };
  allowedRoles?: UserRole[];

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

export interface VoiceIntentResult {
  targetCardId?: string;
  targetCardName?: string;
  actionType: 'add_task' | 'add_goal' | 'set_blocker' | 'trigger_deploy' | 'create_card' | 'analyze' | 'general';
  payload: {
    title?: string;
    description?: string;
    goal?: string;
    blocker?: string;
    status?: 'todo' | 'in-progress' | 'done';
    tags?: string[];
  };
  naturalResponse: string;
}

export interface DependencyLink {
  sourceId: string;
  targetId: string;
  relationType: 'depends_on' | 'monitors' | 'orchestrates' | 'data_flow';
  label?: string;
}

export interface DeploymentEvent {
  id: string;
  cardId: string;
  cardName: string;
  status: 'pending' | 'success' | 'failure';
  environment: 'production' | 'staging' | 'dev';
  triggeredBy: string;
  timestamp: string;
  logs: string[];
}

export type UserRole = 'viewer' | 'operator' | 'owner';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  workspaceId: string;
  issuedAt?: string;
  expiresAt?: string;
}

export interface WorkspaceConfig {
  id: string;
  name: string;
  description: string;
  systemCount?: number;
  createdAt: string;
}

export interface RealtimeEvent {
  type: 'card:created' | 'card:updated' | 'card:deleted' | 'deployment:triggered' | 'telemetry:ingest' | 'intent:executed';
  payload: any;
  timestamp: string;
  workspaceId?: string;
}

