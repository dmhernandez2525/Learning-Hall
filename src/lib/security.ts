import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  SSOConfig,
  IPRestriction,
  RolePermission,
  SecurityAnalytics,
} from '@/types/security';

// --------------- Formatters ---------------

export function formatSSOConfig(doc: Record<string, unknown>): SSOConfig {
  const org = doc.organization as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    organizationId: typeof org === 'object' ? String(org.id) : String(org ?? ''),
    provider: (doc.provider as SSOConfig['provider']) ?? 'saml',
    name: String(doc.name ?? ''),
    issuerUrl: String(doc.issuerUrl ?? ''),
    clientId: String(doc.clientId ?? ''),
    metadataUrl: doc.metadataUrl ? String(doc.metadataUrl) : null,
    redirectUrl: String(doc.redirectUrl ?? ''),
    isEnabled: Boolean(doc.isEnabled),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatIPRestriction(doc: Record<string, unknown>): IPRestriction {
  const org = doc.organization as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    organizationId: typeof org === 'object' ? String(org.id) : String(org ?? ''),
    label: String(doc.label ?? ''),
    cidrRange: String(doc.cidrRange ?? ''),
    action: (doc.action as IPRestriction['action']) ?? 'allow',
    isActive: Boolean(doc.isActive ?? true),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatRolePermission(doc: Record<string, unknown>): RolePermission {
  const org = doc.organization as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    organizationId: typeof org === 'object' ? String(org.id) : String(org ?? ''),
    role: String(doc.role ?? ''),
    resource: String(doc.resource ?? ''),
    actions: Array.isArray(doc.actions) ? (doc.actions as string[]) : [],
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- SSO Configs ---------------

export async function listSSOConfigs(orgId?: string): Promise<SSOConfig[]> {
  const payload = await getPayloadClient();
  const where: Where = orgId ? { organization: { equals: orgId } } : {};
  const result = await payload.find({
    collection: 'sso-configs',
    where,
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatSSOConfig(doc as Record<string, unknown>));
}

interface CreateSSOInput {
  organizationId: string;
  provider: SSOConfig['provider'];
  name: string;
  issuerUrl: string;
  clientId: string;
  clientSecret?: string;
  metadataUrl?: string;
  redirectUrl: string;
}

export async function createSSOConfig(input: CreateSSOInput, user: User): Promise<SSOConfig> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'sso-configs',
    data: {
      organization: input.organizationId,
      provider: input.provider,
      name: input.name,
      issuerUrl: input.issuerUrl,
      clientId: input.clientId,
      clientSecret: input.clientSecret ?? '',
      metadataUrl: input.metadataUrl ?? '',
      redirectUrl: input.redirectUrl,
      isEnabled: false,
      tenant: user.tenant,
    },
  });
  return formatSSOConfig(doc as Record<string, unknown>);
}

export async function toggleSSO(id: string, isEnabled: boolean): Promise<SSOConfig> {
  const payload = await getPayloadClient();
  const doc = await payload.update({
    collection: 'sso-configs',
    id,
    data: { isEnabled },
  });
  return formatSSOConfig(doc as Record<string, unknown>);
}

// --------------- IP Restrictions ---------------

export async function listIPRestrictions(orgId?: string): Promise<IPRestriction[]> {
  const payload = await getPayloadClient();
  const where: Where = orgId ? { organization: { equals: orgId } } : {};
  const result = await payload.find({
    collection: 'ip-restrictions',
    where,
    sort: '-createdAt',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatIPRestriction(doc as Record<string, unknown>));
}

interface CreateIPRuleInput {
  organizationId: string;
  label: string;
  cidrRange: string;
  action: IPRestriction['action'];
}

export async function createIPRestriction(input: CreateIPRuleInput, user: User): Promise<IPRestriction> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'ip-restrictions',
    data: {
      organization: input.organizationId,
      label: input.label,
      cidrRange: input.cidrRange,
      action: input.action,
      isActive: true,
      tenant: user.tenant,
    },
  });
  return formatIPRestriction(doc as Record<string, unknown>);
}

// --------------- Role Permissions ---------------

export async function listRolePermissions(orgId?: string): Promise<RolePermission[]> {
  const payload = await getPayloadClient();
  const where: Where = orgId ? { organization: { equals: orgId } } : {};
  const result = await payload.find({
    collection: 'role-permissions',
    where,
    sort: 'role',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatRolePermission(doc as Record<string, unknown>));
}

interface CreatePermissionInput {
  organizationId: string;
  role: string;
  resource: string;
  actions: string[];
}

export async function createRolePermission(input: CreatePermissionInput, user: User): Promise<RolePermission> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'role-permissions',
    data: {
      organization: input.organizationId,
      role: input.role,
      resource: input.resource,
      actions: input.actions,
      tenant: user.tenant,
    },
  });
  return formatRolePermission(doc as Record<string, unknown>);
}

// --------------- Analytics ---------------

export async function getSecurityAnalytics(orgId?: string): Promise<SecurityAnalytics> {
  const payload = await getPayloadClient();
  const where: Where = orgId ? { organization: { equals: orgId } } : {};

  const sso = await payload.find({ collection: 'sso-configs', where, limit: 100, depth: 0 });
  const ips = await payload.find({ collection: 'ip-restrictions', where, limit: 200, depth: 0 });
  const perms = await payload.find({ collection: 'role-permissions', where, limit: 1, depth: 0 });

  let enabledSSO = 0;
  for (const doc of sso.docs) {
    if (Boolean((doc as Record<string, unknown>).isEnabled)) enabledSSO += 1;
  }

  let activeIPRules = 0;
  const rulesByAction: Record<string, number> = {};
  for (const doc of ips.docs) {
    const raw = doc as Record<string, unknown>;
    if (Boolean(raw.isActive)) activeIPRules += 1;
    const action = String(raw.action ?? 'allow');
    rulesByAction[action] = (rulesByAction[action] ?? 0) + 1;
  }

  return {
    totalSSOConfigs: sso.totalDocs,
    enabledSSO,
    totalIPRules: ips.totalDocs,
    activeIPRules,
    totalRolePermissions: perms.totalDocs,
    rulesByAction,
  };
}
