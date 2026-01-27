import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">No media files yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Upload videos, images, and documents to use in your courses.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button>Upload Files</Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings/storage">Configure Storage</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MediaPage() {
  const media: unknown[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Manage your videos, images, and documents
          </p>
        </div>
        <Button>Upload Files</Button>
      </div>

      {media.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {/* Media cards will be rendered here */}
        </div>
      )}
    </div>
  );
}
