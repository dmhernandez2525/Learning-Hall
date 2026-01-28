import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApiKeysSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">
          Manage API keys for external integrations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>
            Generate and manage API keys for programmatic access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            API key management features are coming soon. You&apos;ll be able to:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
            <li>Generate new API keys</li>
            <li>Set key permissions and scopes</li>
            <li>Monitor API usage</li>
            <li>Revoke compromised keys</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
