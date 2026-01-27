import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload';

// Placeholder thumbnail URLs for different video types
const VIDEO_PLACEHOLDER_THUMBNAILS = {
  default: '/images/video-placeholder.svg',
  processing: '/images/video-processing.svg',
};

// Helper to check if a file is a video
function isVideoFile(mimeType?: string): boolean {
  return Boolean(mimeType?.startsWith('video/'));
}

// Hook to handle video uploads and set default thumbnail
const handleVideoUpload: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation === 'create') {
    data.uploadedBy = req.user?.id;
    data.tenant = req.user?.tenant;

    // Set default placeholder thumbnail for videos
    if (isVideoFile(data.mimeType)) {
      data.thumbnailStatus = 'pending';
    }
  }
  return data;
};

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'mimeType', 'thumbnailStatus', 'createdAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return { uploadedBy: { equals: req.user?.id } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  upload: {
    staticDir: 'media',
    mimeTypes: [
      'image/*',
      'video/*',
      'audio/*',
      'application/pdf',
      'application/zip',
      'text/plain',
      'text/markdown',
    ],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 320,
        height: 180,
        position: 'centre',
      },
      {
        name: 'card',
        width: 640,
        height: 360,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1280,
        height: 720,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Alternative text for accessibility',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Caption or description for the media',
      },
    },
    // Video thumbnail fields
    {
      name: 'customThumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Custom thumbnail image for videos. If not set, auto-generated or placeholder is used.',
        condition: (data) => isVideoFile(data?.mimeType),
      },
    },
    {
      name: 'thumbnailStatus',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Pending Generation', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Generated', value: 'generated' },
        { label: 'Failed', value: 'failed' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        position: 'sidebar',
        condition: (data) => isVideoFile(data?.mimeType),
      },
    },
    {
      name: 'generatedThumbnailUrl',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'URL of the auto-generated thumbnail',
        condition: (data) => isVideoFile(data?.mimeType) && data?.thumbnailStatus === 'generated',
      },
    },
    // Video metadata
    {
      name: 'videoMetadata',
      type: 'group',
      admin: {
        condition: (data) => isVideoFile(data?.mimeType),
      },
      fields: [
        {
          name: 'duration',
          type: 'number',
          admin: {
            description: 'Video duration in seconds',
            readOnly: true,
          },
        },
        {
          name: 'width',
          type: 'number',
          admin: {
            description: 'Video width in pixels',
            readOnly: true,
          },
        },
        {
          name: 'height',
          type: 'number',
          admin: {
            description: 'Video height in pixels',
            readOnly: true,
          },
        },
        {
          name: 'codec',
          type: 'text',
          admin: {
            description: 'Video codec',
            readOnly: true,
          },
        },
        {
          name: 'bitrate',
          type: 'number',
          admin: {
            description: 'Video bitrate in kbps',
            readOnly: true,
          },
        },
      ],
    },
    // Ownership fields
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [handleVideoUpload],
    afterChange: [
      async ({ doc, operation }) => {
        // Trigger thumbnail generation job for new video uploads
        // In production, this would queue a job to ffmpeg
        if (operation === 'create' && isVideoFile(doc.mimeType)) {
          // Log for now - in production this would trigger a background job
          console.log(`Video uploaded: ${doc.id}. Thumbnail generation would be triggered here.`);
        }
      },
    ],
  },
};

// Export helper for use in other parts of the application
export function getVideoThumbnailUrl(media: {
  customThumbnail?: { url?: string } | string;
  generatedThumbnailUrl?: string;
  thumbnailStatus?: string;
  mimeType?: string;
}): string {
  // 1. Use custom thumbnail if provided
  if (media.customThumbnail) {
    if (typeof media.customThumbnail === 'object' && media.customThumbnail.url) {
      return media.customThumbnail.url;
    }
  }

  // 2. Use generated thumbnail if available
  if (media.thumbnailStatus === 'generated' && media.generatedThumbnailUrl) {
    return media.generatedThumbnailUrl;
  }

  // 3. Return appropriate placeholder
  if (media.thumbnailStatus === 'processing') {
    return VIDEO_PLACEHOLDER_THUMBNAILS.processing;
  }

  return VIDEO_PLACEHOLDER_THUMBNAILS.default;
}
