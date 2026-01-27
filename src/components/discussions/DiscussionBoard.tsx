'use client';

import { useState, useMemo } from 'react';
import type { DiscussionThread, ThreadListResult } from '@/lib/discussions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface DiscussionBoardProps {
  courseId: string;
  courseTitle: string;
  initialData: ThreadListResult;
}

function richTextFromString(value: string) {
  return [
    {
      type: 'paragraph',
      children: [{ text: value }],
    },
  ];
}

function plainTextFromContent(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map((item) => plainTextFromContent(item)).join(' ');
  }
  if (typeof value === 'object') {
    const node = value as Record<string, unknown>;
    if (typeof node.text === 'string') return node.text;
    if (Array.isArray(node.children)) return plainTextFromContent(node.children);
  }
  return '';
}

export default function DiscussionBoard({ courseId, courseTitle, initialData }: DiscussionBoardProps) {
  const [threads, setThreads] = useState<DiscussionThread[]>(initialData.docs);
  const [page, setPage] = useState(initialData.page);
  const [hasNextPage, setHasNextPage] = useState(initialData.hasNextPage);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [composerTitle, setComposerTitle] = useState('');
  const [composerBody, setComposerBody] = useState('');
  const [composerTags, setComposerTags] = useState('');
  const [composerError, setComposerError] = useState<string | null>(null);

  const pinnedThreads = useMemo(() => threads.filter((thread) => thread.isPinned), [threads]);
  const otherThreads = useMemo(() => threads.filter((thread) => !thread.isPinned), [threads]);

  const fetchThreads = async (nextPage = 1, query = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        courseId,
        page: nextPage.toString(),
        limit: '20',
      });
      if (query) params.set('search', query);
      const response = await fetch(`/api/discussions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch discussions');
      const data: ThreadListResult = await response.json();
      if (nextPage === 1) {
        setThreads(data.docs);
      } else {
        setThreads((prev) => [...prev, ...data.docs]);
      }
      setPage(data.page);
      setHasNextPage(data.hasNextPage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (thread: DiscussionThread, value: -1 | 0 | 1) => {
    const newValue = thread.userVote === value ? 0 : value;
    setThreads((prev) =>
      prev.map((item) =>
        item.id === thread.id
          ? {
              ...item,
              userVote: newValue,
              voteScore: item.voteScore + (newValue - (item.userVote || 0)),
            }
          : item
      )
    );
    try {
      await fetch(`/api/discussions/${thread.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      });
    } catch (error) {
      console.error('Failed to vote', error);
    }
  };

  const handleCreateThread = async (event: React.FormEvent) => {
    event.preventDefault();
    setComposerError(null);
    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title: composerTitle,
          body: richTextFromString(composerBody),
          tags: composerTags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setComposerError(data.error || 'Failed to create discussion');
        return;
      }
      setThreads((prev) => [data.doc as DiscussionThread, ...prev]);
      setShowComposer(false);
      setComposerTitle('');
      setComposerBody('');
      setComposerTags('');
    } catch (error) {
      console.error('Create thread error', error);
      setComposerError('Failed to create discussion');
    }
  };

  const renderThreadCard = (thread: DiscussionThread) => {
    const preview = plainTextFromContent(thread.body).slice(0, 160);
    return (
      <Card key={thread.id} className={`${thread.isPinned ? 'border-amber-400' : ''}`}>
        <CardContent className="py-4 flex gap-4">
          <div className="flex flex-col items-center min-w-[64px]">
            <button
              type="button"
              onClick={() => handleVote(thread, 1)}
              className={`text-lg ${thread.userVote === 1 ? 'text-primary' : 'text-muted-foreground'}`}
            >
              ▲
            </button>
            <span className="font-semibold">{thread.voteScore}</span>
            <button
              type="button"
              onClick={() => handleVote(thread, -1)}
              className={`text-lg ${thread.userVote === -1 ? 'text-primary' : 'text-muted-foreground'}`}
            >
              ▼
            </button>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {thread.isPinned && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Pinned</span>
              )}
              {thread.isAnswered && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Answered</span>
              )}
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full capitalize">{thread.status}</span>
            </div>
            <Link href={`/student/courses/${courseId}/discussions/${thread.id}`} className="block">
              <CardTitle className="text-lg">{thread.title}</CardTitle>
            </Link>
            <p className="text-sm text-muted-foreground">{preview || 'Click to view thread details.'}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>
                {thread.author.name || 'Anonymous'} {thread.author.role === 'instructor' && '• Instructor'}
              </span>
              <span>Replies: {thread.replyCount}</span>
              <span>
                Updated {thread.lastActivityAt ? new Date(thread.lastActivityAt).toLocaleString() : 'Recently'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {thread.tags.map((tag) => (
                <span key={`${thread.id}-${tag}`} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">{courseTitle}</p>
          <h1 className="text-3xl font-bold">Discussion Board</h1>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search discussions"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-64"
          />
          <Button onClick={() => fetchThreads(1, search)} disabled={loading}>
            Search
          </Button>
          <Button onClick={() => setShowComposer(true)}>New Thread</Button>
        </div>
      </div>

      {pinnedThreads.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">Pinned</h2>
          {pinnedThreads.map(renderThreadCard)}
        </div>
      )}

      <div className="space-y-3">
        {otherThreads.map(renderThreadCard)}
        {!loading && otherThreads.length === 0 && pinnedThreads.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground">
              No discussions yet. Start the first conversation!
            </CardContent>
          </Card>
        )}
        {hasNextPage && (
          <Button variant="outline" onClick={() => fetchThreads(page + 1)} disabled={loading}>
            {loading ? 'Loading…' : 'Load More'}
          </Button>
        )}
      </div>

      {showComposer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Start a new thread</h2>
              <Button variant="ghost" onClick={() => setShowComposer(false)}>
                Close
              </Button>
            </div>
            {composerError && <p className="text-sm text-red-500">{composerError}</p>}
            <form className="space-y-4" onSubmit={handleCreateThread}>
              <div className="space-y-2">
                <label htmlFor="thread-title" className="text-sm font-medium">
                  Title
                </label>
                <Input id="thread-title" value={composerTitle} onChange={(event) => setComposerTitle(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="thread-body" className="text-sm font-medium">
                  Question / Details
                </label>
                <textarea
                  id="thread-body"
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={composerBody}
                  onChange={(event) => setComposerBody(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="thread-tags" className="text-sm font-medium">
                  Tags (comma separated)
                </label>
                <Input
                  id="thread-tags"
                  value={composerTags}
                  onChange={(event) => setComposerTags(event.target.value)}
                  placeholder="general, homework, lecture"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowComposer(false)}>
                  Cancel
                </Button>
                <Button type="submit">Post Thread</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
