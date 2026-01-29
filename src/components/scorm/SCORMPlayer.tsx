'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  RotateCcw,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface SCORMPlayerProps {
  packageId: string;
  attemptId: string;
  contentUrl: string;
  version: string;
  settings?: {
    fullScreen?: boolean;
    width?: number;
    height?: number;
    exitBehavior?: 'close' | 'redirect' | 'completion';
  };
  onComplete?: (result: { status: string; score?: number }) => void;
  onExit?: () => void;
  className?: string;
}

export function SCORMPlayer({
  packageId,
  attemptId,
  contentUrl,
  version,
  settings,
  onComplete,
  onExit,
  className,
}: SCORMPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(settings?.fullScreen || false);
  const [status, setStatus] = useState<'loading' | 'active' | 'completed' | 'error'>(
    'loading'
  );
  const [currentScore, setCurrentScore] = useState<number | null>(null);

  // SCORM API data
  const cmiDataRef = useRef<Record<string, string>>({});

  // Initialize SCORM API on window
  useEffect(() => {
    const initAPI = async () => {
      try {
        // Load existing attempt data
        const response = await fetch(
          `/api/scorm/runtime?attemptId=${attemptId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.attempt?.cmiData) {
            cmiDataRef.current = data.attempt.cmiData;
          }
        }

        // Create SCORM API based on version
        if (version === 'scorm-1.2') {
          createSCORM12API();
        } else if (version.startsWith('scorm-2004')) {
          createSCORM2004API();
        }

        setLoading(false);
        setStatus('active');
      } catch (err) {
        console.error('Failed to initialize SCORM API:', err);
        setError('Failed to initialize SCORM content');
        setStatus('error');
      }
    };

    initAPI();

    return () => {
      // Cleanup
      if (window.API) {
        delete (window as unknown as Record<string, unknown>).API;
      }
      if (window.API_1484_11) {
        delete (window as unknown as Record<string, unknown>).API_1484_11;
      }
    };
  }, [attemptId, version]);

  // Create SCORM 1.2 API
  const createSCORM12API = useCallback(() => {
    const api = {
      LMSInitialize: () => {
        console.log('SCORM 1.2: LMSInitialize');
        sendRuntimeCall('LMSInitialize');
        return 'true';
      },
      LMSFinish: () => {
        console.log('SCORM 1.2: LMSFinish');
        sendRuntimeCall('LMSFinish', { data: cmiDataRef.current });
        handleCompletion();
        return 'true';
      },
      LMSGetValue: (element: string) => {
        const value = cmiDataRef.current[element] || '';
        console.log(`SCORM 1.2: LMSGetValue(${element}) = ${value}`);
        return value;
      },
      LMSSetValue: (element: string, value: string) => {
        console.log(`SCORM 1.2: LMSSetValue(${element}, ${value})`);
        cmiDataRef.current[element] = value;

        // Track score
        if (element === 'cmi.core.score.raw') {
          setCurrentScore(parseFloat(value));
        }

        // Track status
        if (element === 'cmi.core.lesson_status') {
          if (value === 'completed' || value === 'passed' || value === 'failed') {
            setStatus('completed');
          }
        }

        return 'true';
      },
      LMSCommit: () => {
        console.log('SCORM 1.2: LMSCommit');
        sendRuntimeCall('LMSCommit', { data: cmiDataRef.current });
        return 'true';
      },
      LMSGetLastError: () => '0',
      LMSGetErrorString: () => 'No error',
      LMSGetDiagnostic: () => 'No error',
    };

    (window as unknown as Record<string, unknown>).API = api;
  }, []);

  // Create SCORM 2004 API
  const createSCORM2004API = useCallback(() => {
    const api = {
      Initialize: () => {
        console.log('SCORM 2004: Initialize');
        sendRuntimeCall('Initialize');
        return 'true';
      },
      Terminate: () => {
        console.log('SCORM 2004: Terminate');
        sendRuntimeCall('Terminate', { data: cmiDataRef.current });
        handleCompletion();
        return 'true';
      },
      GetValue: (element: string) => {
        const value = cmiDataRef.current[element] || '';
        console.log(`SCORM 2004: GetValue(${element}) = ${value}`);
        return value;
      },
      SetValue: (element: string, value: string) => {
        console.log(`SCORM 2004: SetValue(${element}, ${value})`);
        cmiDataRef.current[element] = value;

        // Track score
        if (element === 'cmi.score.scaled' || element === 'cmi.score.raw') {
          const scoreValue = parseFloat(value);
          setCurrentScore(element === 'cmi.score.scaled' ? scoreValue * 100 : scoreValue);
        }

        // Track status
        if (element === 'cmi.completion_status' || element === 'cmi.success_status') {
          if (
            value === 'completed' ||
            value === 'passed' ||
            value === 'failed'
          ) {
            setStatus('completed');
          }
        }

        return 'true';
      },
      Commit: () => {
        console.log('SCORM 2004: Commit');
        sendRuntimeCall('Commit', { data: cmiDataRef.current });
        return 'true';
      },
      GetLastError: () => '0',
      GetErrorString: () => 'No error',
      GetDiagnostic: () => 'No error',
    };

    (window as unknown as Record<string, unknown>).API_1484_11 = api;
  }, []);

  // Send runtime call to server
  const sendRuntimeCall = async (
    action: string,
    additionalData?: Record<string, unknown>
  ) => {
    try {
      await fetch('/api/scorm/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          packageId,
          action,
          ...additionalData,
        }),
      });
    } catch (err) {
      console.error('Runtime call failed:', err);
    }
  };

  // Handle completion
  const handleCompletion = useCallback(() => {
    const lessonStatus =
      cmiDataRef.current['cmi.core.lesson_status'] ||
      cmiDataRef.current['cmi.completion_status'];
    const scoreRaw =
      cmiDataRef.current['cmi.core.score.raw'] ||
      cmiDataRef.current['cmi.score.raw'];
    const scoreScaled = cmiDataRef.current['cmi.score.scaled'];

    let finalScore: number | undefined;
    if (scoreScaled) {
      finalScore = parseFloat(scoreScaled) * 100;
    } else if (scoreRaw) {
      finalScore = parseFloat(scoreRaw);
    }

    onComplete?.({ status: lessonStatus || 'unknown', score: finalScore });
  }, [onComplete]);

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Handle exit
  const handleExit = () => {
    // Commit any pending data
    sendRuntimeCall('Commit', { data: cmiDataRef.current });
    onExit?.();
  };

  // Handle restart
  const handleRestart = async () => {
    setLoading(true);
    cmiDataRef.current = {};

    // Create new attempt
    const response = await fetch(`/api/scorm/packages/${packageId}/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forceNewAttempt: true }),
    });

    if (response.ok) {
      const data = await response.json();
      window.location.href = data.launchUrl;
    }
  };

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg font-medium text-destructive mb-2">Error</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col',
        isFullScreen ? 'fixed inset-0 z-50 bg-background' : '',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-muted border-b">
        <div className="flex items-center gap-2">
          {status === 'completed' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : status === 'active' ? (
            <Play className="h-5 w-5 text-primary" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin" />
          )}
          <span className="text-sm font-medium">
            {status === 'completed'
              ? 'Completed'
              : status === 'active'
                ? 'In Progress'
                : 'Loading...'}
          </span>
          {currentScore !== null && (
            <span className="text-sm text-muted-foreground ml-2">
              Score: {currentScore.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRestart}
            title="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullScreen}
            title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullScreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExit}
            title="Exit"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 relative"
        style={{
          height: isFullScreen ? 'calc(100vh - 48px)' : settings?.height || 768,
          width: isFullScreen ? '100%' : settings?.width || '100%',
        }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={contentUrl}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="SCORM Content"
        />
      </div>
    </div>
  );
}

// Type declarations for SCORM APIs
declare global {
  interface Window {
    API?: {
      LMSInitialize: () => string;
      LMSFinish: () => string;
      LMSGetValue: (element: string) => string;
      LMSSetValue: (element: string, value: string) => string;
      LMSCommit: () => string;
      LMSGetLastError: () => string;
      LMSGetErrorString: (code: string) => string;
      LMSGetDiagnostic: (code: string) => string;
    };
    API_1484_11?: {
      Initialize: () => string;
      Terminate: () => string;
      GetValue: (element: string) => string;
      SetValue: (element: string, value: string) => string;
      Commit: () => string;
      GetLastError: () => string;
      GetErrorString: (code: string) => string;
      GetDiagnostic: (code: string) => string;
    };
  }
}
