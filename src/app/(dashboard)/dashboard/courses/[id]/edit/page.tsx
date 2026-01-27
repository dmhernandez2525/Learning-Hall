'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { use } from 'react';

type PageProps = {
  params: Promise<{ id: string }>;
};

interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  status: 'draft' | 'published' | 'archived';
  price: {
    amount: number;
    currency: string;
  };
  settings?: {
    allowPreview?: boolean;
    requireSequentialProgress?: boolean;
    certificateEnabled?: boolean;
  };
}

export default function EditCoursePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await fetch(`/api/courses/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data.doc);
        } else {
          setError('Course not found');
        }
      } catch {
        setError('Failed to load course');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourse();
  }, [id]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          slug: formData.get('slug'),
          shortDescription: formData.get('shortDescription'),
          status: formData.get('status'),
          price: {
            amount: parseInt(formData.get('price') as string, 10) * 100,
            currency: formData.get('currency'),
          },
          settings: {
            allowPreview: formData.get('allowPreview') === 'on',
            requireSequentialProgress: formData.get('requireSequentialProgress') === 'on',
            certificateEnabled: formData.get('certificateEnabled') === 'on',
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update course');
      }

      router.push(`/dashboard/courses/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
          <p className="text-red-500">{error}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
          <p className="text-muted-foreground">Update course details and settings</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/courses/${id}`}>Cancel</Link>
        </Button>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>Basic information about your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={course.title}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={course.slug}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  defaultValue={course.shortDescription || ''}
                  maxLength={300}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">Max 300 characters</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={course.status}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={isSaving}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      defaultValue={course.price.amount / 100}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      name="currency"
                      defaultValue={course.price.currency}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={isSaving}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="allowPreview"
                    defaultChecked={course.settings?.allowPreview}
                    className="rounded border-input"
                    disabled={isSaving}
                  />
                  <span className="text-sm">Allow preview lessons</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="requireSequentialProgress"
                    defaultChecked={course.settings?.requireSequentialProgress}
                    className="rounded border-input"
                    disabled={isSaving}
                  />
                  <span className="text-sm">Require sequential progress</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="certificateEnabled"
                    defaultChecked={course.settings?.certificateEnabled}
                    className="rounded border-input"
                    disabled={isSaving}
                  />
                  <span className="text-sm">Issue certificate on completion</span>
                </label>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
