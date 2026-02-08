'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type StorageProvider = 's3' | 'r2' | 'gcs' | 'local';

const providerInfo: Record<StorageProvider, { name: string; description: string }> = {
  s3: { name: 'Amazon S3', description: 'Store media in your own AWS S3 bucket' },
  r2: { name: 'Cloudflare R2', description: 'Store media in Cloudflare R2 (S3-compatible)' },
  gcs: { name: 'Google Cloud Storage', description: 'Store media in Google Cloud Storage' },
  local: { name: 'Local Storage', description: 'Store media on the server filesystem' },
};

function ProviderSelector({
  selected,
  onSelect,
}: {
  selected: StorageProvider;
  onSelect: (provider: StorageProvider) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {(Object.keys(providerInfo) as StorageProvider[]).map((provider) => (
        <div
          key={provider}
          onClick={() => onSelect(provider)}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selected === provider
              ? 'border-primary bg-primary/5'
              : 'hover:border-primary/50'
          }`}
        >
          <h4 className="font-semibold">{providerInfo[provider].name}</h4>
          <p className="text-sm text-muted-foreground">
            {providerInfo[provider].description}
          </p>
        </div>
      ))}
    </div>
  );
}

function S3ConfigForm({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bucket">Bucket Name</Label>
          <Input
            id="bucket"
            name="bucket"
            placeholder="my-learning-hall-bucket"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            name="region"
            placeholder="us-east-1"
            required
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="accessKeyId">Access Key ID</Label>
        <Input
          id="accessKeyId"
          name="accessKeyId"
          type="password"
          placeholder="AKIA..."
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="secretAccessKey">Secret Access Key</Label>
        <Input
          id="secretAccessKey"
          name="secretAccessKey"
          type="password"
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prefix">Path Prefix (optional)</Label>
        <Input
          id="prefix"
          name="prefix"
          placeholder="media/"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Optional prefix for all uploaded files
        </p>
      </div>
    </div>
  );
}

function R2ConfigForm({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bucket">Bucket Name</Label>
          <Input
            id="bucket"
            name="bucket"
            placeholder="my-learning-hall-bucket"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountId">Account ID</Label>
          <Input
            id="accountId"
            name="accountId"
            placeholder="your-account-id"
            required
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="accessKeyId">Access Key ID</Label>
        <Input
          id="accessKeyId"
          name="accessKeyId"
          type="password"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="secretAccessKey">Secret Access Key</Label>
        <Input
          id="secretAccessKey"
          name="secretAccessKey"
          type="password"
          required
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

function GCSConfigForm({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bucket">Bucket Name</Label>
          <Input
            id="bucket"
            name="bucket"
            placeholder="my-learning-hall-bucket"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectId">Project ID</Label>
          <Input
            id="projectId"
            name="projectId"
            placeholder="my-gcp-project"
            required
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="credentials">Service Account Key (JSON)</Label>
        <textarea
          id="credentials"
          name="credentials"
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
          placeholder='{"type": "service_account", ...}'
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Paste your service account JSON key
        </p>
      </div>
    </div>
  );
}

function LocalConfigForm({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="path">Storage Path</Label>
        <Input
          id="path"
          name="path"
          placeholder="/var/data/learning-hall/media"
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Absolute path on the server filesystem
        </p>
      </div>
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Local storage is suitable for development only.
          For production, use a cloud storage provider like S3, R2, or GCS.
        </p>
      </div>
    </div>
  );
}

export default function StorageSettingsPage() {
  const [provider, setProvider] = useState<StorageProvider>('s3');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const config: Record<string, string> = { provider };

    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        config[key] = value;
      }
    });

    try {
      const response = await fetch('/api/storage-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save configuration');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  const renderConfigForm = () => {
    const forms: Record<StorageProvider, React.ReactNode> = {
      s3: <S3ConfigForm isLoading={isLoading} />,
      r2: <R2ConfigForm isLoading={isLoading} />,
      gcs: <GCSConfigForm isLoading={isLoading} />,
      local: <LocalConfigForm isLoading={isLoading} />,
    };
    return forms[provider];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Storage Configuration</h1>
          <p className="text-muted-foreground">
            Configure your preferred storage provider for media files
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/settings">Back to Settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose Storage Provider</CardTitle>
          <CardDescription>
            Select where you want to store your media files. Learning Hall supports
            Bring Your Own Storage (BYOS) - use your own cloud storage credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderSelector selected={provider} onSelect={setProvider} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{providerInfo[provider].name} Configuration</CardTitle>
          <CardDescription>
            Enter your {providerInfo[provider].name} credentials
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-500 bg-green-50 dark:bg-green-900/20 rounded-md">
                Storage configuration saved successfully!
              </div>
            )}
            {renderConfigForm()}
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
