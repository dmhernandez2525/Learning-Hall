'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Video,
  Calendar,
  Clock,
  Users,
  Radio,
  PlayCircle,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  MessageSquare,
  HelpCircle,
  FileText,
  ExternalLink,
  Download,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SessionData {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'published' | 'live' | 'ended' | 'canceled';
  host?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: { url: string } | null;
  } | null;
  coHosts?: Array<{
    id: string;
    name?: string;
    avatar?: { url: string } | null;
  }>;
  course?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  scheduling?: {
    scheduledAt?: string;
    duration?: number;
    timezone?: string;
    actualStartedAt?: string;
    actualEndedAt?: string;
  };
  platform?: {
    provider?: string;
    joinUrl?: string | null;
    embedCode?: string | null;
  };
  settings?: {
    maxAttendees?: number;
    requiresEnrollment?: boolean;
    requiresRegistration?: boolean;
    enableChat?: boolean;
    enableQA?: boolean;
  };
  recording?: {
    available?: boolean;
    url?: string;
    duration?: number;
    downloadUrl?: string;
    transcriptUrl?: string;
  };
  materials?: Array<{
    title: string;
    type?: string;
    file?: { url: string } | null;
    url?: string;
    availableAfterSession?: boolean;
  }>;
  stats?: {
    registrations?: number;
    attendees?: number;
    peakAttendees?: number;
  };
  image?: { url: string } | null;
  isRegistered?: boolean;
  isHost?: boolean;
  isCoHost?: boolean;
}

interface SessionDetailProps {
  sessionId: string;
  className?: string;
}

export function SessionDetail({ sessionId, className }: SessionDetailProps) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [joining, setJoining] = useState(false);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/live-sessions/${sessionId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        throw new Error('Failed to fetch session');
      }

      const data = await response.json();
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const response = await fetch(`/api/live-sessions/${sessionId}/register`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to register');
      }
      await fetchSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    setRegistering(true);
    try {
      const response = await fetch(`/api/live-sessions/${sessionId}/register`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel registration');
      }
      await fetchSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setRegistering(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const response = await fetch(`/api/live-sessions/${sessionId}/join`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join');
      }
      const data = await response.json();
      if (data.joinUrl) {
        window.open(data.joinUrl, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  if (loading) {
    return (
      <div className={cn('space-y-8', className)}>
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="h-32" />
          </div>
          <div>
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className={cn('text-center py-12', className)}>
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h2 className="text-xl font-semibold mb-2">{error || 'Session not found'}</h2>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/live-sessions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Link>
        </Button>
      </div>
    );
  }

  const isUpcoming = ['scheduled', 'published'].includes(session.status);
  const isLive = session.status === 'live';
  const hasRecording = session.status === 'ended' && session.recording?.available;
  const canShowMaterials = session.status === 'ended' || session.isHost || session.isCoHost;

  return (
    <div className={cn('space-y-8', className)}>
      {/* Back link */}
      <Link
        href="/live-sessions"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Sessions
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {isLive && (
                <Badge className="bg-red-500 text-white animate-pulse gap-1">
                  <Radio className="w-3 h-3" />
                  LIVE NOW
                </Badge>
              )}
              {isUpcoming && <Badge variant="secondary">Upcoming</Badge>}
              {session.status === 'ended' && <Badge variant="outline">Ended</Badge>}
              {session.status === 'canceled' && <Badge variant="destructive">Canceled</Badge>}
              {session.platform?.provider && (
                <Badge variant="outline" className="capitalize">
                  {session.platform.provider.replace('_', ' ')}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{session.title}</h1>

            {/* Course link */}
            {session.course && (
              <p className="text-muted-foreground">
                Part of{' '}
                <Link
                  href={`/courses/${session.course.slug}`}
                  className="text-primary hover:underline"
                >
                  {session.course.title}
                </Link>
              </p>
            )}
          </div>

          {/* Image/Video */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            {hasRecording && session.recording?.url ? (
              <video
                src={session.recording.url}
                controls
                className="w-full h-full"
                poster={session.image?.url}
              />
            ) : session.image?.url ? (
              <Image
                src={session.image.url}
                alt={session.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <Video className="w-24 h-24 text-blue-500/50" />
              </div>
            )}
          </div>

          {/* Host Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hosted By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={session.host?.avatar?.url} />
                  <AvatarFallback>
                    {session.host?.name?.charAt(0) || 'H'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{session.host?.name || 'Host'}</p>
                  {session.host?.email && (
                    <p className="text-sm text-muted-foreground">{session.host.email}</p>
                  )}
                </div>
              </div>

              {session.coHosts && session.coHosts.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground mb-2">Co-hosts</p>
                  <div className="flex -space-x-2">
                    {session.coHosts.map((coHost) => (
                      <Avatar key={coHost.id} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={coHost.avatar?.url} />
                        <AvatarFallback>{coHost.name?.charAt(0) || 'C'}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {session.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About This Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: session.description }}
                />
              </CardContent>
            </Card>
          )}

          {/* Materials */}
          {canShowMaterials && session.materials && session.materials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Session Materials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {session.materials.map((material, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span>{material.title}</span>
                      {material.type && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {material.type}
                        </Badge>
                      )}
                    </div>
                    {(material.file?.url || material.url) && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={material.file?.url || material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recording Downloads */}
          {hasRecording && (session.recording?.downloadUrl || session.recording?.transcriptUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recording</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {session.recording?.downloadUrl && (
                  <Button variant="outline" asChild>
                    <a href={session.recording.downloadUrl} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download Video
                    </a>
                  </Button>
                )}
                {session.recording?.transcriptUrl && (
                  <Button variant="outline" asChild>
                    <a href={session.recording.transcriptUrl} download>
                      <FileText className="w-4 h-4 mr-2" />
                      Download Transcript
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-6">
              {/* Schedule */}
              <div>
                <h3 className="font-semibold mb-3">Schedule</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(session.scheduling?.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {formatTime(session.scheduling?.scheduledAt)}
                      {session.scheduling?.timezone && ` (${session.scheduling.timezone})`}
                    </span>
                  </div>
                  {session.scheduling?.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDuration(session.scheduling.duration)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Stats */}
              <div>
                <h3 className="font-semibold mb-3">Attendance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{session.stats?.registrations || 0} registered</span>
                  </div>
                  {session.settings?.maxAttendees && (
                    <p className="text-xs text-muted-foreground">
                      Max capacity: {session.settings.maxAttendees}
                    </p>
                  )}
                  {session.status === 'ended' && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{session.stats?.peakAttendees || 0} peak attendance</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">Features</h3>
                <div className="space-y-2 text-sm">
                  {session.settings?.enableChat && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span>Live Chat</span>
                    </div>
                  )}
                  {session.settings?.enableQA && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      <span>Q&A</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                {isLive && (
                  <Button
                    className="w-full gap-2 bg-red-500 hover:bg-red-600"
                    onClick={handleJoin}
                    disabled={joining}
                  >
                    {joining ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Radio className="w-4 h-4" />
                    )}
                    Join Now
                  </Button>
                )}

                {isUpcoming && !session.isRegistered && (
                  <Button
                    className="w-full"
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    {registering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Register for Session'
                    )}
                  </Button>
                )}

                {isUpcoming && session.isRegistered && (
                  <>
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">You&apos;re Registered</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCancelRegistration}
                      disabled={registering}
                    >
                      {registering ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Cancel Registration'
                      )}
                    </Button>
                  </>
                )}

                {hasRecording && (
                  <Button variant="secondary" className="w-full gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Watch Recording
                  </Button>
                )}

                {(session.isHost || session.isCoHost) && isUpcoming && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/sessions/${session.id}/edit`}>
                      Edit Session
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
