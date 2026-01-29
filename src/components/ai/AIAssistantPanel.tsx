'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Bot,
  MessageSquare,
  History,
  Lightbulb,
  BookOpen,
  Sparkles,
  Loader2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { AIChatWidget } from './AIChatWidget';

interface Conversation {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  messageCount: number;
}

interface AIAssistantPanelProps {
  context?: {
    courseId?: string;
    lessonId?: string;
    quizId?: string;
  };
  className?: string;
}

export function AIAssistantPanel({ context, className }: AIAssistantPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (context?.courseId) {
        params.set('courseId', context.courseId);
      }
      params.set('limit', '10');

      const response = await fetch(`/api/ai/conversations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [context?.courseId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/ai/conversations?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // Silently fail
    }
  };

  const explainSelection = async () => {
    if (!selectedText) return;

    setLoadingExplanation(true);
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'explain',
          content: selectedText,
          context,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExplanation(data.explanation);
      }
    } catch {
      setExplanation('Failed to generate explanation. Please try again.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="shrink-0 grid grid-cols-3 w-full">
          <TabsTrigger value="chat" className="gap-1">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="explain" className="gap-1">
            <Lightbulb className="w-4 h-4" />
            Explain
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 mt-4 overflow-hidden">
          <AIChatWidget
            context={context}
            minimizable={false}
            className="h-full w-full"
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 mt-4 overflow-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Conversations
              </h3>
              <Button variant="ghost" size="sm" onClick={fetchConversations}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground">
                  Start a new chat to see your history here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <Card
                    key={conv.id}
                    className={cn(
                      'cursor-pointer hover:bg-muted/50 transition-colors',
                      selectedConversation === conv.id && 'border-primary'
                    )}
                    onClick={() => {
                      setSelectedConversation(conv.id);
                      setActiveTab('chat');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{conv.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.preview}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{formatDate(conv.createdAt)}</span>
                            <span>•</span>
                            <span>{conv.messageCount} messages</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Explain Tab */}
        <TabsContent value="explain" className="flex-1 mt-4 overflow-auto">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Explainer
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Paste or type text you want explained:
                  </label>
                  <textarea
                    value={selectedText}
                    onChange={(e) => setSelectedText(e.target.value)}
                    placeholder="Enter a concept, term, or passage you want explained..."
                    className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                  />
                </div>

                <Button
                  onClick={explainSelection}
                  disabled={!selectedText.trim() || loadingExplanation}
                  className="w-full gap-2"
                >
                  {loadingExplanation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating explanation...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4" />
                      Explain This
                    </>
                  )}
                </Button>

                {explanation && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4" />
                      Explanation
                    </h4>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
