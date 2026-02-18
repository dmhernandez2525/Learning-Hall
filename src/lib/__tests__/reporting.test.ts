import { describe, it, expect } from 'vitest';
import { formatDefinition, formatExecution } from '../reporting';

describe('formatDefinition', () => {
  it('maps a full report definition document', () => {
    const doc: Record<string, unknown> = {
      id: 'rpt-1',
      name: 'Monthly Enrollment',
      description: 'Enrollment stats by month',
      organization: 'org-1',
      createdBy: 'user-1',
      reportType: 'enrollment',
      columns: [{ key: 'name', label: 'Name', dataType: 'string', sortable: true }],
      filters: [{ field: 'status', operator: 'equals', value: 'active' }],
      schedule: {
        frequency: 'monthly',
        dayOfMonth: 1,
        hour: 8,
        exportFormat: 'csv',
        recipients: ['admin@test.com'],
      },
      lastRunAt: '2026-02-01T08:00:00Z',
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatDefinition(doc);
    expect(result.id).toBe('rpt-1');
    expect(result.name).toBe('Monthly Enrollment');
    expect(result.organizationId).toBe('org-1');
    expect(result.createdBy).toBe('user-1');
    expect(result.reportType).toBe('enrollment');
    expect(result.columns).toHaveLength(1);
    expect(result.filters).toHaveLength(1);
    expect(result.schedule?.frequency).toBe('monthly');
    expect(result.lastRunAt).toBe('2026-02-01T08:00:00Z');
    expect(result.status).toBe('active');
  });

  it('handles object references', () => {
    const doc: Record<string, unknown> = {
      id: 'rpt-2',
      name: 'Compliance Report',
      organization: { id: 'org-2' },
      createdBy: { id: 'user-2' },
      reportType: 'compliance',
      columns: [],
      filters: [],
      schedule: null,
      status: 'draft',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatDefinition(doc);
    expect(result.organizationId).toBe('org-2');
    expect(result.createdBy).toBe('user-2');
    expect(result.schedule).toBeNull();
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'rpt-3' };
    const result = formatDefinition(doc);
    expect(result.name).toBe('');
    expect(result.description).toBe('');
    expect(result.reportType).toBe('custom');
    expect(result.status).toBe('draft');
    expect(result.columns).toEqual([]);
    expect(result.filters).toEqual([]);
    expect(result.schedule).toBeNull();
    expect(result.lastRunAt).toBeNull();
  });
});

describe('formatExecution', () => {
  it('maps a full execution document', () => {
    const doc: Record<string, unknown> = {
      id: 'exec-1',
      report: { id: 'rpt-1', name: 'Monthly Enrollment' },
      executedBy: { id: 'user-1' },
      status: 'completed',
      exportFormat: 'csv',
      rowCount: 150,
      fileUrl: '/exports/report-1.csv',
      errorMessage: '',
      startedAt: '2026-02-01T08:00:00Z',
      completedAt: '2026-02-01T08:01:00Z',
    };

    const result = formatExecution(doc);
    expect(result.id).toBe('exec-1');
    expect(result.reportId).toBe('rpt-1');
    expect(result.reportName).toBe('Monthly Enrollment');
    expect(result.executedBy).toBe('user-1');
    expect(result.status).toBe('completed');
    expect(result.exportFormat).toBe('csv');
    expect(result.rowCount).toBe(150);
    expect(result.fileUrl).toBe('/exports/report-1.csv');
    expect(result.completedAt).toBe('2026-02-01T08:01:00Z');
  });

  it('handles string references', () => {
    const doc: Record<string, unknown> = {
      id: 'exec-2',
      report: 'rpt-2',
      executedBy: 'user-2',
      status: 'failed',
      exportFormat: 'json',
      rowCount: 0,
      errorMessage: 'Timeout',
      startedAt: '2026-02-01T09:00:00Z',
      completedAt: null,
    };

    const result = formatExecution(doc);
    expect(result.reportId).toBe('rpt-2');
    expect(result.reportName).toBe('');
    expect(result.errorMessage).toBe('Timeout');
    expect(result.completedAt).toBeNull();
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'exec-3' };
    const result = formatExecution(doc);
    expect(result.status).toBe('pending');
    expect(result.exportFormat).toBe('csv');
    expect(result.rowCount).toBe(0);
    expect(result.fileUrl).toBeNull();
    expect(result.errorMessage).toBeNull();
    expect(result.completedAt).toBeNull();
  });
});
