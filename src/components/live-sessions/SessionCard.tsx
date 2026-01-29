'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Video,
  Calendar,
  Clock,
  Users,
  Radio,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    description?: string;
    status: 'draft' | 'scheduled' | 'published' | 'live' | 'ended' | 'canceled';
    host?: {
      id: string;
      name?: string;
      avatar?: { url: string } | null;
    } | null;
    scheduling?: {
      scheduledAt?: string;
      duration?: number;
      timezone?: string;
    };
    settings?: {
      maxAttendees?: number;
    };
    stats?: {
      registrations?: number;
      attendees?: number;
    };
    image?: { url: string } | null;
    recording?: {
      available?: boolean;
      url?: string;
    };
    platform?: {
      provider?: string;
    };
  };
  className?: string;
  onRegister?: (sessionId: string) => void;
  onJoin?: (sessionId: string) => void;
}

export function SessionCard({ session, className, onRegister, onJoin }: SessionCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  const getStatusBadge = () => {
    switch (session.status) {
      case 'live':
        return (
          <Badge className="bg-red-500 text-white animate-pulse gap-1">
            <Radio className="w-3 h-3" />
            LIVE
          </Badge>
        );
      case 'scheduled':
      case 'published':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'ended':
        return <Badge variant="outline">Ended</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return null;
    }
  };

  const isUpcoming = ['scheduled', 'published'].includes(session.status);
  const isLive = session.status === 'live';
  const hasRecording = session.status === 'ended' && session.recording?.available;

  return (
    <Card className={cn(
      'group overflow-hidden transition-all hover:shadow-lg',
      isLive && 'ring-2 ring-red-500',
      className
    )}>
      <CardHeader className="p-0">
        <Link href={`/live-sessions/${session.id}`}>
          <div className="relative aspect-video bg-muted overflow-hidden">
            {session.image?.url ? (
              <Image
                src={session.image.url}
                alt={session.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <Video className="w-16 h-16 text-blue-500/50" />
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-2 left-2">
              {getStatusBadge()}
            </div>

            {/* Platform Badge */}
            {session.platform?.provider && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="capitalize">
                  {session.platform.provider.replace('_', ' ')}
                </Badge>
              </div>
            )}

            {/* Recording indicator */}
            {hasRecording && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="gap-1">
                  <PlayCircle className="w-3 h-3" />
                  Recording
                </Badge>
              </div>
            )}
          </div>
        </Link>
      </CardHeader>

      <CardContent className="p-4">
        <Link href={`/live-sessions/${session.id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {session.title}
          </h3>
        </Link>

        {/* Host */}
        {session.host && (
          <div className="flex items-center gap-2 mt-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={session.host.avatar?.url} />
              <AvatarFallback>
                {session.host.name?.charAt(0) || 'H'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {session.host.name || 'Host'}
            </span>
          </div>
        )}

        {/* Schedule info */}
        {session.scheduling?.scheduledAt && (
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(session.scheduling.scheduledAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(session.scheduling.scheduledAt)}
            </div>
            {session.scheduling.duration && (
              <div className="flex items-center gap-1">
                {session.scheduling.duration} min
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {isLive ? (
              <span>{session.stats?.attendees || 0} watching</span>
            ) : (
              <span>{session.stats?.registrations || 0} registered</span>
            )}
          </div>
          {session.settings?.maxAttendees && (
            <span className="text-xs">
              (max {session.settings.maxAttendees})
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isLive && (
          <Button
            className="w-full gap-2 bg-red-500 hover:bg-red-600"
            onClick={() => onJoin?.(session.id)}
          >
            <Radio className="w-4 h-4" />
            Join Now
          </Button>
        )}
        {isUpcoming && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onRegister?.(session.id)}
          >
            Register
          </Button>
        )}
        {hasRecording && (
          <Button variant="secondary" className="w-full gap-2" asChild>
            <Link href={`/live-sessions/${session.id}`}>
              <PlayCircle className="w-4 h-4" />
              Watch Recording
            </Link>
          </Button>
        )}
        {session.status === 'ended' && !hasRecording && (
          <Button variant="ghost" className="w-full" disabled>
            Session Ended
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
