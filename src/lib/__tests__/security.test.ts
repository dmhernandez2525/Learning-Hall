import { describe, it, expect } from 'vitest';
import { formatSSOConfig, formatIPRestriction, formatRolePermission } from '../security';

describe('formatSSOConfig', () => {
  it('maps a full SSO config document', () => {
    const doc: Record<string, unknown> = {
      id: 'sso-1',
      organization: 'org-1',
      provider: 'oidc',
      name: 'Google OIDC',
      issuerUrl: 'https://accounts.google.com',
      clientId: 'client-123',
      metadataUrl: 'https://accounts.google.com/.well-known/openid-configuration',
      redirectUrl: 'https://app.example.com/auth/callback',
      isEnabled: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatSSOConfig(doc);
    expect(result.id).toBe('sso-1');
    expect(result.provider).toBe('oidc');
    expect(result.name).toBe('Google OIDC');
    expect(result.isEnabled).toBe(true);
    expect(result.metadataUrl).toContain('openid-configuration');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'sso-2' };
    const result = formatSSOConfig(doc);
    expect(result.provider).toBe('saml');
    expect(result.isEnabled).toBe(false);
    expect(result.metadataUrl).toBeNull();
  });
});

describe('formatIPRestriction', () => {
  it('maps a full IP restriction document', () => {
    const doc: Record<string, unknown> = {
      id: 'ip-1',
      organization: 'org-1',
      label: 'Office Network',
      cidrRange: '10.0.0.0/8',
      action: 'allow',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatIPRestriction(doc);
    expect(result.id).toBe('ip-1');
    expect(result.label).toBe('Office Network');
    expect(result.cidrRange).toBe('10.0.0.0/8');
    expect(result.action).toBe('allow');
    expect(result.isActive).toBe(true);
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'ip-2' };
    const result = formatIPRestriction(doc);
    expect(result.action).toBe('allow');
    expect(result.isActive).toBe(true);
  });
});

describe('formatRolePermission', () => {
  it('maps a full permission document', () => {
    const doc: Record<string, unknown> = {
      id: 'perm-1',
      organization: { id: 'org-1' },
      role: 'manager',
      resource: 'courses',
      actions: ['read', 'create', 'update'],
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatRolePermission(doc);
    expect(result.id).toBe('perm-1');
    expect(result.organizationId).toBe('org-1');
    expect(result.role).toBe('manager');
    expect(result.resource).toBe('courses');
    expect(result.actions).toEqual(['read', 'create', 'update']);
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'perm-2' };
    const result = formatRolePermission(doc);
    expect(result.role).toBe('');
    expect(result.actions).toEqual([]);
  });
});
