import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuditResults } from '../AuditResults';
import { KeyboardAuditView } from '../KeyboardAuditView';
import { AccessibilityAnalyticsDashboard } from '../AccessibilityAnalyticsDashboard';

describe('AuditResults', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<AuditResults />);
    expect(screen.getByText('Loading audits...')).toBeInTheDocument();
  });

  it('renders audits after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'a-1', score: 85, wcagLevel: 'AA',
          issues: [{ rule: 'img-alt', severity: 'error' }],
          status: 'completed',
        }],
      }),
    });

    render(<AuditResults />);
    await waitFor(() => {
      expect(screen.getByText('Score: 85/100')).toBeInTheDocument();
      expect(screen.getByText('WCAG AA')).toBeInTheDocument();
      expect(screen.getByText('1 issues found')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<AuditResults />);
    await waitFor(() => {
      expect(screen.getByText('No accessibility audits yet.')).toBeInTheDocument();
    });
  });
});

describe('KeyboardAuditView', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<KeyboardAuditView />);
    expect(screen.getByText('Loading keyboard audits...')).toBeInTheDocument();
  });

  it('renders keyboard audits after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'ka-1', pageUrl: '/courses/intro',
          tabOrder: ['nav', 'main'], trappedElements: [],
          missingFocus: ['sidebar'], passed: false,
        }],
      }),
    });

    render(<KeyboardAuditView />);
    await waitFor(() => {
      expect(screen.getByText('/courses/intro')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<KeyboardAuditView />);
    await waitFor(() => {
      expect(screen.getByText('No keyboard navigation audits yet.')).toBeInTheDocument();
    });
  });
});

describe('AccessibilityAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<AccessibilityAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalAudits: 31, completedAudits: 25,
          avgScore: 78, totalIssues: 142,
          issuesBySeverity: { error: 45, warning: 67, info: 29 },
        },
      }),
    });

    render(<AccessibilityAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('31')).toBeInTheDocument();
      expect(screen.getByText('78')).toBeInTheDocument();
      expect(screen.getByText('Issues by Severity')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'err' }),
    });
    render(<AccessibilityAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});
