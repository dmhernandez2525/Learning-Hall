import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SSOManager } from '../SSOManager';
import { IPRuleList } from '../IPRuleList';
import { SecurityAnalyticsDashboard } from '../SecurityAnalyticsDashboard';

describe('SSOManager', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SSOManager />);
    expect(screen.getByText('Loading SSO configs...')).toBeInTheDocument();
  });

  it('renders SSO configs after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'sso-1', name: 'Google OIDC', provider: 'oidc',
          issuerUrl: 'https://accounts.google.com', isEnabled: true,
        }],
      }),
    });

    render(<SSOManager />);
    await waitFor(() => {
      expect(screen.getByText('Google OIDC')).toBeInTheDocument();
      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<SSOManager />);
    await waitFor(() => {
      expect(screen.getByText('No SSO providers configured.')).toBeInTheDocument();
    });
  });
});

describe('IPRuleList', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<IPRuleList />);
    expect(screen.getByText('Loading IP rules...')).toBeInTheDocument();
  });

  it('renders IP rules after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'ip-1', label: 'Office', cidrRange: '10.0.0.0/8',
          action: 'allow', isActive: true,
        }],
      }),
    });

    render(<IPRuleList />);
    await waitFor(() => {
      expect(screen.getByText('Office')).toBeInTheDocument();
      expect(screen.getByText('10.0.0.0/8')).toBeInTheDocument();
      expect(screen.getByText('allow')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<IPRuleList />);
    await waitFor(() => {
      expect(screen.getByText('No IP restrictions configured.')).toBeInTheDocument();
    });
  });
});

describe('SecurityAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SecurityAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalSSOConfigs: 3, enabledSSO: 2, totalIPRules: 10,
          activeIPRules: 8, totalRolePermissions: 15,
          rulesByAction: { allow: 7, deny: 3 },
        },
      }),
    });

    render(<SecurityAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'Not found' }),
    });
    render(<SecurityAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});
