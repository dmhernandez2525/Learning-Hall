export interface SSOConfig {
  id: string;
  organizationId: string;
  provider: 'saml' | 'oidc';
  name: string;
  issuerUrl: string;
  clientId: string;
  metadataUrl: string | null;
  redirectUrl: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface IPRestriction {
  id: string;
  organizationId: string;
  label: string;
  cidrRange: string;
  action: 'allow' | 'deny';
  isActive: boolean;
  createdAt: string;
}

export interface RolePermission {
  id: string;
  organizationId: string;
  role: string;
  resource: string;
  actions: string[];
  createdAt: string;
}

export interface SecurityAnalytics {
  totalSSOConfigs: number;
  enabledSSO: number;
  totalIPRules: number;
  activeIPRules: number;
  totalRolePermissions: number;
  rulesByAction: Record<string, number>;
}
