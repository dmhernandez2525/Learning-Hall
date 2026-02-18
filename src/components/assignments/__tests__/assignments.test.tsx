import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AssignmentList } from '../AssignmentList';
import { SubmissionForm } from '../SubmissionForm';
import { AssignmentAnalytics } from '../AssignmentAnalytics';
import type { Assignment } from '@/types/assignments';

const mockAssignment: Assignment = {
  id: 'a1',
  title: 'Test Assignment',
  description: 'Write a report',
  courseId: 'course-1',
  instructorId: 'instructor-1',
  status: 'published',
  dueDate: '2026-12-31T23:59:59Z',
  maxScore: 100,
  allowLateSubmission: false,
  latePenaltyPercent: 10,
  maxResubmissions: 0,
  submissionTypes: ['text'],
  rubric: [
    { criterionId: 'c1', title: 'Quality', description: 'Overall quality', maxPoints: 50 },
    { criterionId: 'c2', title: 'Completeness', description: 'All parts done', maxPoints: 50 },
  ],
  enablePeerReview: false,
  peerReviewsRequired: 2,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('AssignmentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(
      <AssignmentList courseId="course-1" isInstructor={false} onSelect={vi.fn()} />
    );
    expect(screen.getByText('Loading assignments...')).toBeInTheDocument();
  });

  it('renders assignment list after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [mockAssignment] }),
    });

    render(
      <AssignmentList courseId="course-1" isInstructor={false} onSelect={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    });
  });

  it('shows empty state when no assignments', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(
      <AssignmentList courseId="course-1" isInstructor={false} onSelect={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('No assignments available.')).toBeInTheDocument();
    });
  });

  it('shows New Assignment button for instructors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(
      <AssignmentList
        courseId="course-1"
        isInstructor={true}
        onSelect={vi.fn()}
        onCreateNew={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('New Assignment')).toBeInTheDocument();
    });
  });
});

describe('SubmissionForm', () => {
  it('renders text area for text submission type', () => {
    render(<SubmissionForm assignment={mockAssignment} />);
    expect(screen.getByPlaceholderText('Write your response...')).toBeInTheDocument();
  });

  it('shows Submit button', () => {
    render(<SubmissionForm assignment={mockAssignment} />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('shows past due warning when applicable', () => {
    const pastDue = { ...mockAssignment, dueDate: '2020-01-01T00:00:00Z' };
    render(<SubmissionForm assignment={pastDue} />);
    expect(screen.getByText(/past due and late submissions are not accepted/)).toBeInTheDocument();
  });

  it('shows late penalty warning when late submissions allowed', () => {
    const pastDueAllowed = {
      ...mockAssignment,
      dueDate: '2020-01-01T00:00:00Z',
      allowLateSubmission: true,
    };
    render(<SubmissionForm assignment={pastDueAllowed} />);
    expect(screen.getByText(/10% late penalty/)).toBeInTheDocument();
  });
});

describe('AssignmentAnalytics', () => {
  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<AssignmentAnalytics assignmentId="a1" />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalSubmissions: 10,
          gradedCount: 8,
          averageScore: 75,
          onTimeCount: 9,
          lateCount: 1,
          scoreDistribution: [
            { range: '0-20%', count: 0 },
            { range: '21-40%', count: 1 },
            { range: '41-60%', count: 2 },
            { range: '61-80%', count: 3 },
            { range: '81-100%', count: 2 },
          ],
          criteriaAverages: [],
        },
      }),
    });

    render(<AssignmentAnalytics assignmentId="a1" />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });
  });

  it('shows error on fetch failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Forbidden' }),
    });

    render(<AssignmentAnalytics assignmentId="a1" />);

    await waitFor(() => {
      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });
  });
});
