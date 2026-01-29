// Client-safe certificate utilities - no server imports

export interface CertificateTemplate {
  style?: 'classic' | 'modern' | 'minimal' | 'professional' | 'elegant';
  primaryColor?: string;
  accentColor?: string;
  logo?: {
    id: string;
    url?: string;
  };
  backgroundImage?: {
    id: string;
    url?: string;
  };
  signatureName?: string;
  signatureTitle?: string;
  signatureImage?: {
    id: string;
    url?: string;
  };
  additionalText?: string;
  credentialId?: string;
}

export interface Certificate {
  id: string;
  certificateId: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    instructor?: {
      id: string;
      name?: string;
    };
  };
  completionDate: string;
  template?: CertificateTemplate;
  shareCount: number;
  verificationCount: number;
  downloadCount: number;
  isPublic: boolean;
  createdAt: string;
}

// Generate share URLs - client-safe
export function generateShareUrls(certificate: Certificate, baseUrl: string): {
  verifyUrl: string;
  twitter: string;
  linkedin: string;
  email: string;
} {
  const verifyUrl = `${baseUrl}/verify/${certificate.certificateId}`;

  const twitterText = encodeURIComponent(
    `I just completed "${certificate.course.title}" and earned my certificate! 🎓\n\nVerify: `
  );

  const emailSubject = encodeURIComponent(`My Certificate - ${certificate.course.title}`);
  const emailBody = encodeURIComponent(
    `I wanted to share my certificate of completion for "${certificate.course.title}".\n\nYou can verify this certificate at: ${verifyUrl}`
  );

  return {
    verifyUrl,
    twitter: `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(verifyUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`,
    email: `mailto:?subject=${emailSubject}&body=${emailBody}`,
  };
}

// Template style configurations - client-safe
export const templateStyles: Record<string, {
  name: string;
  description: string;
  defaultPrimaryColor: string;
  defaultAccentColor: string;
  fontFamily: string;
  borderStyle: string;
}> = {
  classic: {
    name: 'Classic',
    description: 'Traditional certificate with ornate borders',
    defaultPrimaryColor: '#1a365d',
    defaultAccentColor: '#c9a227',
    fontFamily: 'Georgia, serif',
    borderStyle: 'double 6px',
  },
  modern: {
    name: 'Modern',
    description: 'Clean, contemporary design',
    defaultPrimaryColor: '#2563eb',
    defaultAccentColor: '#e5e7eb',
    fontFamily: 'system-ui, sans-serif',
    borderStyle: 'solid 2px',
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple and elegant',
    defaultPrimaryColor: '#18181b',
    defaultAccentColor: '#f4f4f5',
    fontFamily: 'Inter, sans-serif',
    borderStyle: 'solid 1px',
  },
  professional: {
    name: 'Professional',
    description: 'Corporate-style certificate',
    defaultPrimaryColor: '#0f172a',
    defaultAccentColor: '#64748b',
    fontFamily: 'Arial, sans-serif',
    borderStyle: 'solid 3px',
  },
  elegant: {
    name: 'Elegant',
    description: 'Sophisticated design with subtle gradients',
    defaultPrimaryColor: '#4c1d95',
    defaultAccentColor: '#ddd6fe',
    fontFamily: 'Playfair Display, Georgia, serif',
    borderStyle: 'none',
  },
};

// API call to track certificate counts
export async function trackCertificateAction(
  certificateId: string,
  action: 'share' | 'download' | 'verify'
): Promise<void> {
  try {
    await fetch(`/api/certificates/${certificateId}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });
  } catch (error) {
    console.error(`Error tracking certificate ${action}:`, error);
  }
}
