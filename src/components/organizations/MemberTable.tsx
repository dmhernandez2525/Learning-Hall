'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { OrgMembership } from '@/types/organizations';

interface MemberTableProps {
  organizationId: string;
}

const roleStyles: Record<OrgMembership['role'], string> = {
  owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-blue-100 text-blue-700',
  member: 'bg-gray-100 text-gray-600',
};

export function MemberTable({ organizationId }: MemberTableProps) {
  const [members, setMembers] = useState<OrgMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/members`
      );
      if (!response.ok) return;
      const data = (await response.json()) as { docs: OrgMembership[] };
      setMembers(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading members...</p>;
  }

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No members yet.</p>;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Members ({members.length})</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 pr-4 font-medium">Name</th>
              <th className="pb-2 pr-4 font-medium">Email</th>
              <th className="pb-2 pr-4 font-medium">Role</th>
              <th className="pb-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b last:border-0">
                <td className="py-2 pr-4">{member.userName || 'Unknown'}</td>
                <td className="py-2 pr-4 text-muted-foreground">{member.userEmail}</td>
                <td className="py-2 pr-4">
                  <Badge className={roleStyles[member.role]}>{member.role}</Badge>
                </td>
                <td className="py-2 text-muted-foreground">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
