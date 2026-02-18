import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StudyGroupList } from '../StudyGroupList';
import { CollaborativeNotepad } from '../CollaborativeNotepad';
import { SocialLearningAnalyticsDashboard } from '../SocialLearningAnalyticsDashboard';

describe('StudyGroupList', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<StudyGroupList />);
    expect(screen.getByText('Loading study groups...')).toBeInTheDocument();
  });

  it('renders groups after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'sg-1', name: 'JS Study Group',
          memberCount: 8, maxMembers: 20, isPublic: true,
        }],
      }),
    });

    render(<StudyGroupList />);
    await waitFor(() => {
      expect(screen.getByText('JS Study Group')).toBeInTheDocument();
      expect(screen.getByText('Public')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<StudyGroupList />);
    await waitFor(() => {
      expect(screen.getByText('No study groups yet.')).toBeInTheDocument();
    });
  });
});

describe('CollaborativeNotepad', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<CollaborativeNotepad groupId="sg-1" />);
    expect(screen.getByText('Loading notes...')).toBeInTheDocument();
  });

  it('renders notes after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'n-1', title: 'Chapter 1 Summary',
          content: 'Key points...', authorName: 'Alice',
        }],
      }),
    });

    render(<CollaborativeNotepad groupId="sg-1" />);
    await waitFor(() => {
      expect(screen.getByText('Chapter 1 Summary')).toBeInTheDocument();
      expect(screen.getByText('by Alice')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<CollaborativeNotepad groupId="sg-1" />);
    await waitFor(() => {
      expect(screen.getByText('No collaborative notes yet.')).toBeInTheDocument();
    });
  });
});

describe('SocialLearningAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SocialLearningAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalGroups: 18, activeGroups: 14,
          totalNotes: 96, totalSessions: 42,
          groupsBySize: { 'small (1-5)': 7, 'medium (6-15)': 8, 'large (16+)': 3 },
        },
      }),
    });

    render(<SocialLearningAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('96')).toBeInTheDocument();
      expect(screen.getByText('Groups by Size')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'err' }),
    });
    render(<SocialLearningAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});
