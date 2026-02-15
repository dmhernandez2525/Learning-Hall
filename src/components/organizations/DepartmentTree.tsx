'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Department } from '@/types/organizations';

interface DepartmentTreeProps {
  organizationId: string;
}

interface TreeNode {
  department: Department;
  children: TreeNode[];
}

function buildTree(departments: Department[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const dept of departments) {
    nodeMap.set(dept.id, { department: dept, children: [] });
  }

  for (const dept of departments) {
    const node = nodeMap.get(dept.id);
    if (!node) continue;

    if (dept.parentDepartmentId) {
      const parent = nodeMap.get(dept.parentDepartmentId);
      if (parent) {
        parent.children.push(node);
        continue;
      }
    }
    roots.push(node);
  }

  return roots;
}

function DepartmentNode({ node, depth }: { node: TreeNode; depth: number }) {
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <Card className="mb-2">
        <CardContent className="py-2 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{node.department.name}</p>
            {node.department.managerName && (
              <p className="text-xs text-muted-foreground">
                Manager: {node.department.managerName}
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {node.department.memberCount} members
          </span>
        </CardContent>
      </Card>
      {node.children.map((child) => (
        <DepartmentNode key={child.department.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function DepartmentTree({ organizationId }: DepartmentTreeProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDepts = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/departments`
      );
      if (!response.ok) return;
      const data = (await response.json()) as { docs: Department[] };
      setDepartments(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void fetchDepts();
  }, [fetchDepts]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading departments...</p>;
  }

  if (departments.length === 0) {
    return <p className="text-sm text-muted-foreground">No departments created yet.</p>;
  }

  const tree = buildTree(departments);

  return (
    <div className="space-y-2">
      <CardHeader className="px-0 pb-2">
        <CardTitle className="text-sm">Department Structure</CardTitle>
      </CardHeader>
      {tree.map((node) => (
        <DepartmentNode key={node.department.id} node={node} depth={0} />
      ))}
    </div>
  );
}
