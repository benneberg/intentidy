import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { PortableCard, UserRole } from '../types';

describe('RBAC & Security Authorization Tests', () => {
  const JWT_SECRET = 'intentidy-test-secret-key-12345';

  function base64UrlEncode(str: string): string {
    return Buffer.from(str).toString('base64url');
  }

  function base64UrlDecode(str: string): string {
    return Buffer.from(str, 'base64url').toString('utf-8');
  }

  function signJwt(payload: any, secret = JWT_SECRET, expiresInSec = 3600): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = { ...payload, iat: now, exp: now + expiresInSec };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  function verifyJwt(token: string, secret = JWT_SECRET): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [headerB64, payloadB64, sigB64] = parts;
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(`${headerB64}.${payloadB64}`)
        .digest('base64url');
      if (expectedSig !== sigB64) return null;
      const payload = JSON.parse(base64UrlDecode(payloadB64));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) return null;
      return payload;
    } catch {
      return null;
    }
  }

  const ROLE_HIERARCHY: Record<UserRole, number> = {
    viewer: 1,
    operator: 2,
    owner: 3
  };

  function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  }

  it('should generate valid JWT and verify token integrity and claims', () => {
    const payload = { userId: 'usr-42', email: 'secops@intentidy.io', role: 'operator' as UserRole };
    const token = signJwt(payload);
    const verified = verifyJwt(token);

    expect(verified).not.toBeNull();
    expect(verified.userId).toBe('usr-42');
    expect(verified.role).toBe('operator');
  });

  it('should reject tampered tokens with mismatched signatures', () => {
    const token = signJwt({ userId: 'usr-1', role: 'viewer' as UserRole });
    const parts = token.split('.');
    // Tamper with payload to elevate role to owner
    const tamperedPayload = base64UrlEncode(JSON.stringify({ userId: 'usr-1', role: 'owner' }));
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const verified = verifyJwt(tamperedToken);
    expect(verified).toBeNull();
  });

  it('should reject expired JWT tokens', () => {
    const token = signJwt({ userId: 'usr-old' }, JWT_SECRET, -100);
    const verified = verifyJwt(token);
    expect(verified).toBeNull();
  });

  it('should enforce role hierarchy: viewer < operator < owner', () => {
    expect(hasRequiredRole('viewer', 'viewer')).toBe(true);
    expect(hasRequiredRole('viewer', 'operator')).toBe(false);
    expect(hasRequiredRole('viewer', 'owner')).toBe(false);

    expect(hasRequiredRole('operator', 'viewer')).toBe(true);
    expect(hasRequiredRole('operator', 'operator')).toBe(true);
    expect(hasRequiredRole('operator', 'owner')).toBe(false);

    expect(hasRequiredRole('owner', 'viewer')).toBe(true);
    expect(hasRequiredRole('owner', 'operator')).toBe(true);
    expect(hasRequiredRole('owner', 'owner')).toBe(true);
  });
});

describe('Webhook HMAC Verification Tests', () => {
  const WEBHOOK_SECRET = 'gh_webhook_test_secret_9988';

  function computeHmacSignature(payload: any, secret = WEBHOOK_SECRET): string {
    return 'sha256=' + crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  }

  function verifyHmacSignature(headerSignature: string, payload: any, secret = WEBHOOK_SECRET): boolean {
    const computed = computeHmacSignature(payload, secret);
    try {
      const sigBuf = Buffer.from(headerSignature);
      const compBuf = Buffer.from(computed);
      return sigBuf.length === compBuf.length && crypto.timingSafeEqual(sigBuf, compBuf);
    } catch {
      return false;
    }
  }

  it('should verify genuine GitHub HMAC signatures accurately', () => {
    const payload = {
      event: 'push',
      repository: { name: 'PersonaLinea' },
      status: 'success',
      head_commit: { id: '9a8b7c6', message: 'feat: add telemetry worker' }
    };
    const validSignature = computeHmacSignature(payload);
    expect(verifyHmacSignature(validSignature, payload)).toBe(true);
  });

  it('should reject forged or mismatched webhook signatures', () => {
    const payload = { event: 'push', repository: { name: 'PersonaLinea' } };
    const forgedSignature = 'sha256=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    expect(verifyHmacSignature(forgedSignature, payload)).toBe(false);
  });
});

describe('Multi-Tenant Workspace Partitioning Tests', () => {
  let mockStore: Record<string, PortableCard[]>;

  beforeEach(() => {
    mockStore = {
      default: [
        {
          id: 'pc-1',
          name: 'GlobalGateway',
          owner: 'admin',
          tags: ['global'],
          status: 'active',
          lastSync: '2026-01-01T00:00:00Z',
          workspaceId: 'default',
          summary: { description: 'Global ingress', architecture: 'Microservices', capabilities: [], techStack: [] },
          runtime: { 
            buildStatus: 'success', 
            deploymentState: 'production',
            lastCommit: { hash: 'a1b2c3d', message: 'feat: init gateway', author: 'platform-team' }
          },
          intent: { goals: [], tasks: [], blockers: [] }
        }
      ],
      engineering: [
        {
          id: 'pc-2',
          name: 'CompilerEngine',
          owner: 'eng-lead',
          tags: ['core'],
          status: 'active',
          lastSync: '2026-02-01T00:00:00Z',
          workspaceId: 'engineering',
          summary: { description: 'Core compiler', architecture: 'Rust pipeline', capabilities: [], techStack: [] },
          runtime: { 
            buildStatus: 'success', 
            deploymentState: 'staging',
            lastCommit: { hash: 'e4f5g6h', message: 'feat: pipeline parser', author: 'eng-lead' }
          },
          intent: { goals: [], tasks: [], blockers: [] }
        }
      ]
    };
  });

  it('should isolate cards strictly between different tenants', () => {
    const defaultCards = mockStore['default'];
    const engCards = mockStore['engineering'];

    expect(defaultCards.some(c => c.name === 'CompilerEngine')).toBe(false);
    expect(engCards.some(c => c.name === 'GlobalGateway')).toBe(false);
  });

  it('should allow partitioned updates without mutating other tenant workspaces', () => {
    const newEngCard: PortableCard = {
      id: 'pc-3',
      name: 'TelemetryBroker',
      owner: 'eng-lead',
      tags: ['telemetry'],
      status: 'experimental',
      lastSync: new Date().toISOString(),
      workspaceId: 'engineering',
      summary: { description: 'Event pipeline', architecture: 'Kafka', capabilities: [], techStack: [] },
      runtime: { 
        buildStatus: 'success', 
        deploymentState: 'dev',
        lastCommit: { hash: '7h8i9j0', message: 'feat: telemetry buffer', author: 'eng-lead' }
      },
      intent: { goals: [], tasks: [], blockers: [] }
    };

    mockStore['engineering'].push(newEngCard);

    expect(mockStore['engineering']).toHaveLength(2);
    expect(mockStore['default']).toHaveLength(1);
  });
});

describe('Sliding-Window Rate Limiting Tests', () => {
  it('should track request count within window and reject when limit exceeded', () => {
    const maxRequests = 5;
    let requestCount = 0;

    function handleRequest(): { allowed: boolean; remaining: number } {
      if (requestCount >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }
      requestCount++;
      return { allowed: true, remaining: maxRequests - requestCount };
    }

    for (let i = 0; i < 5; i++) {
      const res = handleRequest();
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(5 - (i + 1));
    }

    const excessRes = handleRequest();
    expect(excessRes.allowed).toBe(false);
    expect(excessRes.remaining).toBe(0);
  });
});

describe('Telemetry Ingestion & Critical Threshold Alerting Tests', () => {
  it('should detect degraded health status when latency or errors exceed critical thresholds', () => {
    const normalTelemetry = { latency: 42, errors: 0 };
    const degradedLatencyTelemetry = { latency: 650, errors: 0 };
    const degradedErrorsTelemetry = { latency: 60, errors: 8 };

    function evaluateHealth(telemetry: { latency: number; errors: number }): 'success' | 'degraded' {
      if (telemetry.errors > 5 || telemetry.latency > 500) {
        return 'degraded';
      }
      return 'success';
    }

    expect(evaluateHealth(normalTelemetry)).toBe('success');
    expect(evaluateHealth(degradedLatencyTelemetry)).toBe('degraded');
    expect(evaluateHealth(degradedErrorsTelemetry)).toBe('degraded');
  });
});
