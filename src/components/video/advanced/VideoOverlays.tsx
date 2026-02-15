'use client';

import type { VideoAnnotation, VideoHotspot } from '@/types/video-learning';

interface VideoOverlaysProps {
  annotations: VideoAnnotation[];
  hotspots: VideoHotspot[];
  currentTime: number;
}

export function VideoOverlays({ annotations, hotspots, currentTime }: VideoOverlaysProps) {
  const activeAnnotations = annotations.filter(
    (annotation) =>
      currentTime >= annotation.timestamp &&
      currentTime <= annotation.timestamp + annotation.duration
  );

  const activeHotspots = hotspots.filter(
    (hotspot) =>
      currentTime >= hotspot.startTime &&
      currentTime <= hotspot.endTime
  );

  return (
    <>
      {activeAnnotations.length > 0 ? (
        <div className="pointer-events-none absolute left-4 top-4 max-w-[65%] space-y-2">
          {activeAnnotations.map((annotation) => (
            <p key={annotation.id} className="rounded-md bg-black/70 px-3 py-2 text-sm text-white">
              {annotation.text}
            </p>
          ))}
        </div>
      ) : null}

      {activeHotspots.map((hotspot) => (
        <a
          key={hotspot.id}
          href={hotspot.resourceUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute rounded-md border-2 border-yellow-300 bg-yellow-300/20 text-xs text-white shadow-sm"
          style={{
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            width: `${hotspot.width}%`,
            height: `${hotspot.height}%`,
          }}
          title={hotspot.label}
        >
          <span className="inline-block rounded-br-md bg-black/70 px-1.5 py-0.5">
            {hotspot.label}
          </span>
        </a>
      ))}
    </>
  );
}
