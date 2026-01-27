'use client';

import { useState } from 'react';
import type { DiscussionPost, DiscussionThread } from '@/lib/discussions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DiscussionThreadViewProps {
  initialThread: DiscussionThread;
  initialReplies: DiscussionPost[];
  userRole: 'admin' | 'instructor' | 'student';
}

function plainTextFromContent(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => plainTextFromContent(item)).join(' ');
  if (typeof value === 'object') {
    const node = value as Record<string, unknown>;
    if (typeof node.text === 'string') return node.text;
    if (Array.isArray(node.children)) return plainTextFromContent(node.children);
  }
  return '';
}

function Reply({
  reply,
  onVote,
  onReply,
  canMarkAnswer,
  onMarkAnswer,
}: {
  reply: DiscussionPost;
  onVote: (reply: DiscussionPost, value: -1 | 0 | 1) => void;
  onReply: (reply: DiscussionPost) => void;
  canMarkAnswer: boolean;
  onMarkAnswer: (reply: DiscussionPost, action: 'mark' | 'unmark') => void;
}) {
  return (
    <div className="space-y-2" style={{ marginLeft: reply.depth * 24 }}>
      <Card>
        <CardContent className="py-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{reply.author.name || 'Anonymous'}</span>
              {reply.author.role === 'instructor' && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Instructor</span>
              )}
              <span>{new Date(reply.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => onVote(reply, 1)}
                className={reply.userVote === 1 ? 'text-primary' : 'text-muted-foreground'}
              >
                ▲
              </button>
              <span className="font-semibold">{reply.voteScore}</span>
              <button
                type="button"
                onClick={() => onVote(reply, -1)}
                className={reply.userVote === -1 ? 'text-primary' : 'text-muted-foreground'}
              >
                ▼
              </button>
            </div>
          </div>
          <p>{plainTextFromContent(reply.content)}</p>
          <div className="flex items-center gap-3 text-sm">
            <Button variant="ghost" size="sm" onClick={() => onReply(reply)}>
              Reply
            </Button>
            {canMarkAnswer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAnswer(reply, reply.isAnswer ? 'unmark' : 'mark')}
                className={reply.isAnswer ? 'text-emerald-600' : ''}
              >
                {reply.isAnswer ? 'Unmark answer' : 'Mark as answer'}
              </Button>
            )}
            {reply.isAnswer && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Answer</span>
            )}
          </div>
        </CardContent>
      </Card>
      {reply.children?.map((child) => (
        <Reply
          key={child.id}
          reply={child}
          onVote={onVote}
          onReply={onReply}
          canMarkAnswer={canMarkAnswer}
          onMarkAnswer={onMarkAnswer}
        />
      ))}
    </div>
  );
}

export default function DiscussionThreadView({ initialThread, initialReplies, userRole }: DiscussionThreadViewProps) {
  const [thread, setThread] = useState(initialThread);
  const [replies, setReplies] = useState(initialReplies);
  const [replyBody, setReplyBody] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [loadingReply, setLoadingReply] = useState(false);

  const refreshReplies = async () => {
    try {
      const response = await fetch(`/api/discussions/${thread.id}/replies`);
      if (!response.ok) throw new Error('Failed to load replies');
      const data = await response.json();
      setReplies(data.docs as DiscussionPost[]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVoteThread = async (value: -1 | 0 | 1) => {
    const newValue = thread.userVote === value ? 0 : value;
    setThread((prev) => ({
      ...prev,
      userVote: newValue,
      voteScore: prev.voteScore + (newValue - (prev.userVote || 0)),
    }));
    try {
      await fetch(`/api/discussions/${thread.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleVoteReply = async (reply: DiscussionPost, value: -1 | 0 | 1) => {
    const newValue = reply.userVote === value ? 0 : value;
    const updateReplies = (items: DiscussionPost[]): DiscussionPost[] =>
      items.map((item) => {
        if (item.id === reply.id) {
          return {
            ...item,
            userVote: newValue,
            voteScore: item.voteScore + (newValue - (item.userVote || 0)),
          };
        }
        if (item.children) {
          return { ...item, children: updateReplies(item.children) };
        }
        return item;
      });
    setReplies((prev) => updateReplies(prev));
    try {
      await fetch(`/api/discussions/${thread.id}/replies/${reply.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateReply = async (event: React.FormEvent) => {
    event.preventDefault();
    setComposerError(null);
    setLoadingReply(true);
    try {
      const response = await fetch(`/api/discussions/${thread.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, content: [{ type: 'paragraph', children: [{ text: replyBody }] }] }),
      });
      if (!response.ok) {
        const data = await response.json();
        setComposerError(data.error || 'Failed to post reply');
      } else {
        await refreshReplies();
        setReplyBody('');
        setParentId(undefined);
      }
    } catch (error) {
      console.error(error);
      setComposerError('Failed to post reply');
    } finally {
      setLoadingReply(false);
    }
  };

  const canModerate = ['admin', 'instructor'].includes(userRole);

  const handlePinToggle = async () => {
    try {
      const response = await fetch(`/api/discussions/${thread.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !thread.isPinned }),
      });
      const data = await response.json();
      if (response.ok) {
        setThread(data.doc as DiscussionThread);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAnswer = async (reply: DiscussionPost, action: 'mark' | 'unmark') => {
    try {
      const response = await fetch(`/api/discussions/${thread.id}/replies/${reply.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action === 'mark' ? 'mark-answer' : 'unmark-answer' }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error(data.error);
        return;
      }
      if (action === 'mark') {
        setThread(data.thread as DiscussionThread);
      } else {
        setThread(data.thread as DiscussionThread);
      }
      await refreshReplies();
    } catch (error) {
      console.error(error);
    }
  };

  const renderReplies = (items: DiscussionPost[]) =>
    items.map((reply) => (
      <Reply
        key={reply.id}
        reply={reply}
        onVote={handleVoteReply}
        onReply={(item) => setParentId(item.id)}
        canMarkAnswer={canModerate}
        onMarkAnswer={handleMarkAnswer}
      />
    ));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex flex-wrap items-center gap-2">
            {thread.title}
            {thread.isAnswered && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Answered</span>
            )}
            {thread.isPinned && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pinned</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center min-w-[64px]">
              <button
                type="button"
                onClick={() => handleVoteThread(1)}
                className={thread.userVote === 1 ? 'text-primary text-lg' : 'text-muted-foreground text-lg'}
              >
                ▲
              </button>
              <span className="font-semibold">{thread.voteScore}</span>
              <button
                type="button"
                onClick={() => handleVoteThread(-1)}
                className={thread.userVote === -1 ? 'text-primary text-lg' : 'text-muted-foreground text-lg'}
              >
                ▼
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Posted by {thread.author.name || 'Anonymous'} •{' '}
                {thread.author.role === 'instructor' ? 'Instructor' : thread.author.role?.toUpperCase()}
              </p>
              <p>{plainTextFromContent(thread.body)}</p>
              {canModerate && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handlePinToggle}>
                    {thread.isPinned ? 'Unpin thread' : 'Pin thread'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Replies</h2>
        {renderReplies(replies)}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Add a reply</h3>
        {parentId && (
          <div className="text-sm text-muted-foreground">
            Replying to a comment{' '}
            <button type="button" className="underline" onClick={() => setParentId(undefined)}>
              cancel
            </button>
          </div>
        )}
        {composerError && <p className="text-sm text-red-500">{composerError}</p>}
        <form onSubmit={handleCreateReply} className="space-y-3">
          <textarea
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={replyBody}
            onChange={(event) => setReplyBody(event.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loadingReply}>
              {loadingReply ? 'Posting…' : 'Post Reply'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
