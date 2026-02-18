import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SkillTaxonomy } from '../SkillTaxonomy';
import { GapAnalysis } from '../GapAnalysis';
import { SkillsAnalyticsDashboard } from '../SkillsAnalyticsDashboard';

describe('SkillTaxonomy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SkillTaxonomy />);
    expect(screen.getByText('Loading skills...')).toBeInTheDocument();
  });

  it('renders skill cards after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'skill-1',
              name: 'TypeScript',
              description: 'Typed JS',
              category: 'Programming',
              parentId: null,
              level: 'intermediate',
              status: 'active',
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
        }),
    });

    render(<SkillTaxonomy />);

    await waitFor(() => {
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('intermediate')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  it('shows empty state when no skills', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<SkillTaxonomy />);

    await waitFor(() => {
      expect(screen.getByText('No skills found.')).toBeInTheDocument();
    });
  });
});

describe('GapAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<GapAnalysis />);
    expect(screen.getByText('Loading gap analysis...')).toBeInTheDocument();
  });

  it('renders gap results after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              skillId: 'skill-1',
              skillName: 'TypeScript',
              category: 'Programming',
              currentLevel: 'beginner',
              targetLevel: 'advanced',
              gap: 2,
              recommendedCourses: ['course-1'],
            },
          ],
        }),
    });

    render(<GapAnalysis />);

    await waitFor(() => {
      expect(screen.getByText('Gap: 2 levels')).toBeInTheDocument();
      expect(screen.getByText('Recommended courses: 1')).toBeInTheDocument();
    });
  });

  it('shows empty state when no gaps', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<GapAnalysis />);

    await waitFor(() => {
      expect(screen.getByText('No skill gaps identified.')).toBeInTheDocument();
    });
  });
});

describe('SkillsAnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SkillsAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          doc: {
            totalSkills: 25,
            totalMappings: 40,
            totalAssessments: 120,
            skillsByCategory: { Programming: 15, Design: 10 },
            averageGap: 1.5,
          },
        }),
    });

    render(<SkillsAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('1.5')).toBeInTheDocument();
      expect(screen.getByText('Skills by Category')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    render(<SkillsAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});
