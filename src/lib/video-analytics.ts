import { getPayloadClient } from '@/lib/payload';
import type { LessonVideoAnalytics, VideoHeatmapBin } from '@/types/video-learning';

function createHeatmapBins(duration: number, binSize: number): VideoHeatmapBin[] {
  const bins: VideoHeatmapBin[] = [];
  const safeDuration = Math.max(duration, binSize);

  for (let start = 0; start < safeDuration; start += binSize) {
    bins.push({
      start,
      end: Math.min(start + binSize, safeDuration),
      views: 0,
    });
  }

  return bins;
}

function buildHeatmap(positions: number[], duration: number): VideoHeatmapBin[] {
  if (positions.length === 0) {
    return [];
  }

  const inferredDuration = duration > 0 ? duration : Math.max(...positions, 60);
  const binSize = Math.max(10, Math.ceil(inferredDuration / 20));
  const bins = createHeatmapBins(inferredDuration, binSize);

  positions.forEach((position) => {
    const safePosition = Math.max(0, position);
    const index = Math.min(Math.floor(safePosition / binSize), bins.length - 1);
    if (bins[index]) {
      bins[index].views += 1;
    }
  });

  return bins;
}

export async function getLessonVideoAnalytics(
  lessonId: string,
  duration: number
): Promise<LessonVideoAnalytics> {
  const payload = await getPayloadClient();
  const activity = await payload.find({
    collection: 'lesson-activity',
    where: { lesson: { equals: lessonId } },
    limit: 1000,
    depth: 0,
  });

  const positions = activity.docs
    .map((doc) => Number((doc as Record<string, unknown>).lastPosition ?? 0))
    .filter((position) => Number.isFinite(position));

  const totalViews = positions.length;
  const completionCount =
    duration > 0 ? positions.filter((position) => position >= duration * 0.9).length : 0;
  const completionRate =
    totalViews > 0 ? Number(((completionCount / totalViews) * 100).toFixed(2)) : 0;
  const averageWatchPosition =
    totalViews > 0
      ? Number((positions.reduce((sum, position) => sum + position, 0) / totalViews).toFixed(2))
      : 0;

  const heatmap = buildHeatmap(positions, duration);
  const dropOffPoints = [...heatmap]
    .sort((left, right) => right.views - left.views)
    .slice(0, 5);

  return {
    totalViews,
    completionRate,
    averageWatchPosition,
    heatmap,
    dropOffPoints,
  };
}
