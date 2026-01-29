// Image Optimization Utilities
export interface ImageDimensions {
  width: number;
  height: number;
}

export interface OptimizedImage {
  url: string;
  width: number;
  height: number;
  format: string;
}

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

// Common image sizes for responsive images
export const ImageSizes = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 320, height: 240 },
  medium: { width: 640, height: 480 },
  large: { width: 1280, height: 960 },
  hero: { width: 1920, height: 1080 },
  avatar: { width: 100, height: 100 },
  courseThumbnail: { width: 400, height: 225 },
  courseCard: { width: 300, height: 169 },
} as const;

// Generate optimized image URL using Next.js Image Optimization
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const { width, height, quality = 75, format = 'webp' } = options;

  // If using Vercel, leverage their Image Optimization API
  if (process.env.VERCEL) {
    const params = new URLSearchParams();
    params.set('url', originalUrl);
    if (width) params.set('w', String(width));
    if (height) params.set('h', String(height));
    params.set('q', String(quality));

    return `/_vercel/image?${params.toString()}`;
  }

  // If using Cloudinary, build Cloudinary URL
  if (process.env.CLOUDINARY_CLOUD_NAME && originalUrl.includes('cloudinary')) {
    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);

    if (options.fit === 'cover') {
      transformations.push('c_fill');
    } else if (options.fit === 'contain') {
      transformations.push('c_fit');
    }

    // Insert transformations into Cloudinary URL
    return originalUrl.replace('/upload/', `/upload/${transformations.join(',')}/`);
  }

  // If using S3 with CloudFront + Lambda@Edge, use query params
  if (process.env.CLOUDFRONT_DOMAIN) {
    const params = new URLSearchParams();
    if (width) params.set('w', String(width));
    if (height) params.set('h', String(height));
    params.set('q', String(quality));
    params.set('f', format);

    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}${params.toString()}`;
  }

  // Fallback: use Next.js Image API
  const params = new URLSearchParams();
  params.set('url', encodeURIComponent(originalUrl));
  if (width) params.set('w', String(width));
  params.set('q', String(quality));

  return `/_next/image?${params.toString()}`;
}

// Generate srcset for responsive images
export function generateSrcSet(
  originalUrl: string,
  widths: number[] = [320, 640, 1024, 1280, 1920],
  quality: number = 75
): string {
  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(originalUrl, { width, quality });
      return `${url} ${width}w`;
    })
    .join(', ');
}

// Generate sizes attribute for responsive images
export function generateSizes(breakpoints: { maxWidth: number; size: string }[]): string {
  return breakpoints
    .map((bp) => `(max-width: ${bp.maxWidth}px) ${bp.size}`)
    .concat(['100vw'])
    .join(', ');
}

// Common responsive image configurations
export const ResponsiveImageConfigs = {
  fullWidth: {
    srcSet: [320, 640, 1024, 1280, 1920],
    sizes: generateSizes([
      { maxWidth: 640, size: '100vw' },
      { maxWidth: 1024, size: '80vw' },
      { maxWidth: 1280, size: '60vw' },
    ]),
  },
  card: {
    srcSet: [300, 450, 600],
    sizes: generateSizes([
      { maxWidth: 640, size: '50vw' },
      { maxWidth: 1024, size: '33vw' },
    ]),
  },
  thumbnail: {
    srcSet: [100, 150, 200],
    sizes: '150px',
  },
  avatar: {
    srcSet: [50, 100, 150],
    sizes: '100px',
  },
} as const;

// Lazy loading image component props generator
export interface LazyImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  alt: string;
  loading: 'lazy' | 'eager';
  decoding: 'async' | 'auto' | 'sync';
  placeholder?: string;
}

export function getLazyImageProps(
  url: string,
  alt: string,
  size: keyof typeof ImageSizes = 'medium',
  eager: boolean = false
): LazyImageProps {
  const dimensions = ImageSizes[size];
  const config = size === 'thumbnail' ? ResponsiveImageConfigs.thumbnail
    : size === 'avatar' ? ResponsiveImageConfigs.avatar
    : ResponsiveImageConfigs.card;

  return {
    src: getOptimizedImageUrl(url, { ...dimensions, quality: 80 }),
    srcSet: generateSrcSet(url, config.srcSet),
    sizes: config.sizes,
    width: dimensions.width,
    height: dimensions.height,
    alt,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
    placeholder: generatePlaceholder(dimensions.width, dimensions.height),
  };
}

// Generate a blur placeholder (base64 tiny image)
export function generatePlaceholder(width: number, height: number): string {
  // Simple gray placeholder SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#e5e7eb"/>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Calculate aspect ratio
export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

// Image preload helper
export function generatePreloadLink(url: string, options: ImageOptimizationOptions = {}): string {
  const optimizedUrl = getOptimizedImageUrl(url, options);
  return `<link rel="preload" as="image" href="${optimizedUrl}">`;
}

// Video thumbnail extraction URL (if using video processing service)
export function getVideoThumbnailUrl(
  videoUrl: string,
  timestamp: number = 0,
  size: keyof typeof ImageSizes = 'courseThumbnail'
): string {
  const dimensions = ImageSizes[size];

  // If using Cloudinary for video hosting
  if (process.env.CLOUDINARY_CLOUD_NAME && videoUrl.includes('cloudinary')) {
    return videoUrl
      .replace('/video/upload/', '/video/upload/')
      .replace(/\.\w+$/, `.jpg`)
      .replace('/upload/', `/upload/so_${timestamp},w_${dimensions.width},h_${dimensions.height},c_fill/`);
  }

  // If using Mux
  if (videoUrl.includes('mux.com')) {
    return `https://image.mux.com/${videoUrl.split('/').pop()}/thumbnail.jpg?time=${timestamp}&width=${dimensions.width}&height=${dimensions.height}`;
  }

  // Fallback: return video URL (won't work as image)
  return videoUrl;
}

// Calculate optimal image dimensions preserving aspect ratio
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): ImageDimensions {
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}

// Check if image format is supported
export function isImageFormatSupported(format: string): boolean {
  const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'];
  return supportedFormats.includes(format.toLowerCase());
}

// Get image format from URL
export function getImageFormat(url: string): string | null {
  const match = url.match(/\.(\w+)(?:\?.*)?$/);
  return match ? match[1].toLowerCase() : null;
}
