export interface VideoChapter {
  id: string;
  title: string;
  timestamp: number;
}

export interface VideoHotspot {
  id: string;
  label: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  width: number;
  height: number;
  resourceUrl: string;
}

export interface VideoAnnotation {
  id: string;
  text: string;
  timestamp: number;
  duration: number;
}

export interface VideoQualityOption {
  id: string;
  label: string;
  url: string;
  mimeType?: string;
}

export interface LessonVideoMetadata {
  id: string;
  lessonId: string;
  courseId: string;
  chapters: VideoChapter[];
  hotspots: VideoHotspot[];
  annotations: VideoAnnotation[];
  transcriptVtt: string;
  qualityOptions: VideoQualityOption[];
  updatedAt: string;
}

export interface LessonVideoMetadataInput {
  chapters?: VideoChapter[];
  hotspots?: VideoHotspot[];
  annotations?: VideoAnnotation[];
  transcriptVtt?: string;
  qualityOptions?: VideoQualityOption[];
}

export interface VideoHeatmapBin {
  start: number;
  end: number;
  views: number;
}

export interface LessonVideoAnalytics {
  totalViews: number;
  completionRate: number;
  averageWatchPosition: number;
  heatmap: VideoHeatmapBin[];
  dropOffPoints: VideoHeatmapBin[];
}
