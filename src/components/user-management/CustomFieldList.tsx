'use client';

import { useState, useCallback, useEffect } from 'react';
import type { CustomField } from '@/types/user-management';

export function CustomFieldList() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFields = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/user-management/custom-fields');
    if (res.ok) {
      const data = await res.json();
      setFields(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchFields();
  }, [fetchFields]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading custom fields...</p>;

  if (fields.length === 0) {
    return <p className="text-sm text-muted-foreground">No custom fields defined.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Custom User Fields</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">Field Name</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Required</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.id} className="border-b">
              <td className="py-2">{f.fieldName}</td>
              <td className="py-2">
                <span className="rounded bg-secondary px-2 py-0.5 text-xs">{f.fieldType}</span>
              </td>
              <td className="py-2">{f.isRequired ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
