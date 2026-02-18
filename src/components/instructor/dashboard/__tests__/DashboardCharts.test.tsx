import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  CompletionBarChart,
  RevenuePieChart,
  SimpleLineChart,
} from '../DashboardCharts';

describe('DashboardCharts', () => {
  it('renders line chart with latest value', () => {
    render(
      <SimpleLineChart
        title="Enrollment Trend"
        description="Trend description"
        data={[
          { isoDate: '2026-01-01', label: 'Jan 1', value: 2 },
          { isoDate: '2026-01-02', label: 'Jan 2', value: 5 },
          { isoDate: '2026-01-03', label: 'Jan 3', value: 8 },
        ]}
      />
    );

    expect(screen.getByText('Enrollment Trend')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeTruthy();
  });

  it('renders completion bar chart for top courses', () => {
    render(
      <CompletionBarChart
        courses={[
          {
            courseId: 'course-1',
            title: 'Course One',
            status: 'published',
            enrollments: 10,
            completions: 8,
            completionRate: 80,
            averageTimeSpentMinutes: 12,
            averageQuizScore: 84,
            revenueCents: 10000,
            averageRating: 4.5,
          },
          {
            courseId: 'course-2',
            title: 'Course Two',
            status: 'draft',
            enrollments: 5,
            completions: 2,
            completionRate: 40,
            averageTimeSpentMinutes: 9,
            averageQuizScore: 73,
            revenueCents: 4000,
            averageRating: 3.8,
          },
        ]}
      />
    );

    expect(screen.getByText('Completion Rate by Course')).toBeInTheDocument();
    expect(screen.getByText('Course One')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('renders revenue pie chart legend entries', () => {
    render(
      <RevenuePieChart
        slices={[
          { courseId: 'course-1', title: 'Course One', revenueCents: 10000, sharePercent: 60 },
          { courseId: 'course-2', title: 'Course Two', revenueCents: 5000, sharePercent: 30 },
          { courseId: 'course-3', title: 'Course Three', revenueCents: 2000, sharePercent: 10 },
        ]}
      />
    );

    expect(screen.getByText('Revenue Mix')).toBeInTheDocument();
    expect(screen.getByText('Course One')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });
});

