import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SuggestionList } from '../SuggestionList';
import { QuizGenerator } from '../QuizGenerator';
import { AIContentAnalyticsDashboard } from '../AIContentAnalyticsDashboard';

describe('SuggestionList', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SuggestionList />);
    expect(screen.getByText('Loading suggestions...')).toBeInTheDocument();
  });

  it('renders suggestions after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 's-1', title: 'Add Real-World Example',
          type: 'example', status: 'pending',
          content: 'Consider adding a practical example.',
        }],
      }),
    });

    render(<SuggestionList />);
    await waitFor(() => {
      expect(screen.getByText('Add Real-World Example')).toBeInTheDocument();
      expect(screen.getByText('example')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<SuggestionList />);
    await waitFor(() => {
      expect(screen.getByText('No content suggestions yet.')).toBeInTheDocument();
    });
  });
});

describe('QuizGenerator', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<QuizGenerator />);
    expect(screen.getByText('Loading quizzes...')).toBeInTheDocument();
  });

  it('renders quizzes after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'q-1', title: 'Chapter 1 Review',
          questions: [{ question: 'Q1' }, { question: 'Q2' }, { question: 'Q3' }],
          difficulty: 'medium', status: 'draft',
        }],
      }),
    });

    render(<QuizGenerator />);
    await waitFor(() => {
      expect(screen.getByText('Chapter 1 Review')).toBeInTheDocument();
      expect(screen.getByText('3 questions')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<QuizGenerator />);
    await waitFor(() => {
      expect(screen.getByText('No generated quizzes yet.')).toBeInTheDocument();
    });
  });
});

describe('AIContentAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<AIContentAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalSuggestions: 42, acceptedSuggestions: 18,
          totalQuizzes: 15, publishedQuizzes: 9,
          totalSummaries: 23,
          suggestionsByType: { topic: 12, example: 15, exercise: 8, explanation: 7 },
        },
      }),
    });

    render(<AIContentAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('Suggestions by Type')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'err' }),
    });
    render(<AIContentAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});
