import { describe, it, expect } from 'vitest';
import { formatGroup, formatMembership, formatCustomField } from '../user-management';

describe('formatGroup', () => {
  it('maps a full group document', () => {
    const doc: Record<string, unknown> = {
      id: 'g-1',
      name: 'Engineering',
      description: 'Engineering team',
      organization: 'org-1',
      memberCount: 5,
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatGroup(doc);
    expect(result.id).toBe('g-1');
    expect(result.name).toBe('Engineering');
    expect(result.description).toBe('Engineering team');
    expect(result.organizationId).toBe('org-1');
    expect(result.memberCount).toBe(5);
  });

  it('handles object organization reference', () => {
    const doc: Record<string, unknown> = {
      id: 'g-2',
      name: 'Sales',
      organization: { id: 'org-2', name: 'Acme Corp' },
      memberCount: 3,
      createdAt: '2026-02-01T00:00:00Z',
    };
    const result = formatGroup(doc);
    expect(result.organizationId).toBe('org-2');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'g-3' };
    const result = formatGroup(doc);
    expect(result.name).toBe('');
    expect(result.description).toBe('');
    expect(result.memberCount).toBe(0);
  });
});

describe('formatMembership', () => {
  it('maps a full membership with object refs', () => {
    const doc: Record<string, unknown> = {
      id: 'm-1',
      group: { id: 'g-1', name: 'Engineering' },
      user: { id: 'u-1', name: 'Alice', email: 'alice@example.com' },
      createdAt: '2026-02-05T00:00:00Z',
    };

    const result = formatMembership(doc);
    expect(result.id).toBe('m-1');
    expect(result.groupId).toBe('g-1');
    expect(result.groupName).toBe('Engineering');
    expect(result.userId).toBe('u-1');
    expect(result.userName).toBe('Alice');
    expect(result.userEmail).toBe('alice@example.com');
  });

  it('handles string references', () => {
    const doc: Record<string, unknown> = {
      id: 'm-2',
      group: 'g-2',
      user: 'u-2',
      createdAt: '2026-02-05T00:00:00Z',
    };
    const result = formatMembership(doc);
    expect(result.groupId).toBe('g-2');
    expect(result.groupName).toBe('');
    expect(result.userId).toBe('u-2');
    expect(result.userName).toBe('');
  });
});

describe('formatCustomField', () => {
  it('maps a full custom field', () => {
    const doc: Record<string, unknown> = {
      id: 'cf-1',
      organization: 'org-1',
      fieldName: 'Department',
      fieldType: 'select',
      options: ['Engineering', 'Sales', 'Marketing'],
      isRequired: true,
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatCustomField(doc);
    expect(result.id).toBe('cf-1');
    expect(result.fieldName).toBe('Department');
    expect(result.fieldType).toBe('select');
    expect(result.options).toEqual(['Engineering', 'Sales', 'Marketing']);
    expect(result.isRequired).toBe(true);
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'cf-2' };
    const result = formatCustomField(doc);
    expect(result.fieldName).toBe('');
    expect(result.fieldType).toBe('text');
    expect(result.options).toEqual([]);
    expect(result.isRequired).toBe(false);
  });
});
