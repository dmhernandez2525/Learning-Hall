import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  ReportDefinition,
  ReportExecution,
  ReportColumn,
  ReportFilter,
  ReportSchedule,
  ReportingAnalytics,
} from '@/types/reporting';

// --------------- Formatters ---------------

export function formatDefinition(doc: Record<string, unknown>): ReportDefinition {
  const org = doc.organization as string | Record<string, unknown>;
  const creator = doc.createdBy as string | Record<string, unknown>;
  const columns = Array.isArray(doc.columns)
    ? (doc.columns as ReportColumn[])
    : [];
  const filters = Array.isArray(doc.filters)
    ? (doc.filters as ReportFilter[])
    : [];
  const schedule = doc.schedule && typeof doc.schedule === 'object'
    ? (doc.schedule as ReportSchedule)
    : null;

  return {
    id: String(doc.id),
    name: String(doc.name ?? ''),
    description: String(doc.description ?? ''),
    organizationId: typeof org === 'object' ? String(org.id) : String(org ?? ''),
    createdBy: typeof creator === 'object' ? String(creator.id) : String(creator ?? ''),
    reportType: (doc.reportType as ReportDefinition['reportType']) ?? 'custom',
    columns,
    filters,
    schedule,
    lastRunAt: doc.lastRunAt ? String(doc.lastRunAt) : null,
    status: (doc.status as ReportDefinition['status']) ?? 'draft',
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatExecution(doc: Record<string, unknown>): ReportExecution {
  const report = doc.report as string | Record<string, unknown>;
  const executor = doc.executedBy as string | Record<string, unknown>;
  const reportName = typeof report === 'object'
    ? String((report as Record<string, unknown>).name ?? '')
    : '';

  return {
    id: String(doc.id),
    reportId: typeof report === 'object' ? String(report.id) : String(report ?? ''),
    reportName,
    executedBy: typeof executor === 'object' ? String(executor.id) : String(executor ?? ''),
    status: (doc.status as ReportExecution['status']) ?? 'pending',
    exportFormat: (doc.exportFormat as ReportExecution['exportFormat']) ?? 'csv',
    rowCount: Number(doc.rowCount ?? 0),
    fileUrl: doc.fileUrl ? String(doc.fileUrl) : null,
    errorMessage: doc.errorMessage ? String(doc.errorMessage) : null,
    startedAt: String(doc.startedAt ?? ''),
    completedAt: doc.completedAt ? String(doc.completedAt) : null,
  };
}

// --------------- Report Definitions ---------------

export async function listReportDefinitions(
  orgId?: string
): Promise<ReportDefinition[]> {
  const payload = await getPayloadClient();
  const where: Where = orgId ? { organization: { equals: orgId } } : {};
  const result = await payload.find({
    collection: 'report-definitions',
    where,
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatDefinition(doc as Record<string, unknown>));
}

export async function getReportDefinition(id: string): Promise<ReportDefinition | null> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({ collection: 'report-definitions', id, depth: 0 });
    if (!doc) return null;
    return formatDefinition(doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

interface CreateReportInput {
  name: string;
  description?: string;
  organizationId: string;
  reportType: ReportDefinition['reportType'];
  columns: ReportColumn[];
  filters?: ReportFilter[];
  schedule?: ReportSchedule | null;
}

export async function createReportDefinition(
  input: CreateReportInput,
  user: User
): Promise<ReportDefinition> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'report-definitions',
    data: {
      name: input.name,
      description: input.description ?? '',
      organization: input.organizationId,
      createdBy: user.id,
      reportType: input.reportType,
      columns: input.columns,
      filters: input.filters ?? [],
      schedule: input.schedule ?? null,
      status: 'draft',
      tenant: user.tenant,
    },
  });
  return formatDefinition(doc as Record<string, unknown>);
}

export async function updateReportDefinition(
  id: string,
  data: Partial<CreateReportInput & { status: ReportDefinition['status'] }>
): Promise<ReportDefinition> {
  const payload = await getPayloadClient();
  const updateData: Record<string, unknown> = { ...data };
  if (data.organizationId) {
    updateData.organization = data.organizationId;
    delete updateData.organizationId;
  }
  const doc = await payload.update({
    collection: 'report-definitions',
    id,
    data: updateData,
  });
  return formatDefinition(doc as Record<string, unknown>);
}

// --------------- Report Executions ---------------

export async function executeReport(
  reportId: string,
  exportFormat: ReportExecution['exportFormat'],
  user: User
): Promise<ReportExecution> {
  const payload = await getPayloadClient();

  const execution = await payload.create({
    collection: 'report-executions',
    data: {
      report: reportId,
      executedBy: user.id,
      status: 'running',
      exportFormat,
      rowCount: 0,
      startedAt: new Date().toISOString(),
      tenant: user.tenant,
    },
  });

  const definition = await payload.findByID({
    collection: 'report-definitions',
    id: reportId,
    depth: 0,
  });

  const rowCount = await collectReportData(definition as Record<string, unknown>);

  const completed = await payload.update({
    collection: 'report-executions',
    id: String(execution.id),
    data: {
      status: 'completed',
      rowCount,
      completedAt: new Date().toISOString(),
    },
  });

  await payload.update({
    collection: 'report-definitions',
    id: reportId,
    data: { lastRunAt: new Date().toISOString() },
  });

  return formatExecution(completed as Record<string, unknown>);
}

async function collectReportData(definition: Record<string, unknown>): Promise<number> {
  const payload = await getPayloadClient();
  const reportType = String(definition.reportType ?? 'custom');
  const orgId = String(definition.organization ?? '');

  const collectionMap: Record<string, string> = {
    enrollment: 'enrollments',
    completion: 'course-progress',
    compliance: 'compliance-assignments',
    revenue: 'payments',
    engagement: 'analytics-events',
  };

  const collection = collectionMap[reportType];
  if (!collection) return 0;

  const where: Where = orgId ? { tenant: { equals: orgId } } : {};

  try {
    const result = await payload.find({
      collection,
      where,
      limit: 1,
      depth: 0,
    });
    return result.totalDocs;
  } catch {
    return 0;
  }
}

export async function listExecutions(
  reportId?: string
): Promise<ReportExecution[]> {
  const payload = await getPayloadClient();
  const where: Where = reportId ? { report: { equals: reportId } } : {};
  const result = await payload.find({
    collection: 'report-executions',
    where,
    sort: '-startedAt',
    limit: 50,
    depth: 1,
  });
  return result.docs.map((doc) => formatExecution(doc as Record<string, unknown>));
}

export async function getExecution(id: string): Promise<ReportExecution | null> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({ collection: 'report-executions', id, depth: 1 });
    if (!doc) return null;
    return formatExecution(doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

// --------------- Scheduled Reports ---------------

export async function getScheduledReports(): Promise<ReportDefinition[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'report-definitions',
    where: {
      and: [
        { status: { equals: 'active' } },
        { schedule: { not_equals: null } },
      ],
    },
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatDefinition(doc as Record<string, unknown>));
}

// --------------- Analytics ---------------

export async function getReportingAnalytics(orgId?: string): Promise<ReportingAnalytics> {
  const payload = await getPayloadClient();

  const defWhere: Where = orgId ? { organization: { equals: orgId } } : {};
  const definitions = await payload.find({
    collection: 'report-definitions',
    where: defWhere,
    limit: 200,
    depth: 0,
  });

  let activeReports = 0;
  let scheduledReports = 0;
  const executionsByType: Record<string, number> = {};

  for (const doc of definitions.docs) {
    const raw = doc as Record<string, unknown>;
    const status = String(raw.status ?? '');
    const rType = String(raw.reportType ?? 'custom');

    if (status === 'active') activeReports += 1;
    if (raw.schedule) scheduledReports += 1;
    executionsByType[rType] = (executionsByType[rType] ?? 0) + 1;
  }

  const executions = await payload.find({
    collection: 'report-executions',
    limit: 1,
    depth: 0,
  });

  return {
    totalReports: definitions.totalDocs,
    activeReports,
    scheduledReports,
    totalExecutions: executions.totalDocs,
    executionsByType,
  };
}
