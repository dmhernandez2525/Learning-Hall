export type VideoStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'failed';

export interface VideoMetadata {
  duration?: number; // seconds
  width?: number;
  height?: number;
  format?: string;
  codec?: string;
  bitrate?: number;
  frameRate?: number;
  size: number;
}

export interface VideoUpload {
  id: string;
  filename: string;
  originalName: string;
  status: VideoStatus;
  progress: number;
  metadata?: VideoMetadata;
  storageKey?: string;
  thumbnailKey?: string;
  hlsPlaylistKey?: string;
  error?: string;
  uploaderId: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InitiateUploadResult {
  uploadId: string;
  signedUrl: string;
  expiresAt: number;
}

export interface CompleteUploadResult {
  success: boolean;
  video?: VideoUpload;
  error?: string;
}

export interface VideoUploadOptions {
  filename: string;
  contentType: string;
  size: number;
  tenantId?: string;
  lessonId?: string;
}
