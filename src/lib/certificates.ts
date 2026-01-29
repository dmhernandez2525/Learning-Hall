import { getPayloadClient } from '@/lib/payload';

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

function formatCertificate(doc: Record<string, unknown>): Certificate {
  const user = doc.user as Record<string, unknown>;
  const course = doc.course as Record<string, unknown>;
  const instructor = course?.instructor as Record<string, unknown> | undefined;
  const template = doc.template as Record<string, unknown> | undefined;

  return {
    id: String(doc.id),
    certificateId: String(doc.certificateId),
    user: {
      id: String(user?.id || ''),
      name: user?.name ? String(user.name) : undefined,
      email: String(user?.email || ''),
    },
    course: {
      id: String(course?.id || ''),
      title: String(course?.title || ''),
      instructor: instructor ? {
        id: String(instructor.id),
        name: instructor.name ? String(instructor.name) : undefined,
      } : undefined,
    },
    completionDate: String(doc.completionDate),
    template: template ? {
      style: template.style as CertificateTemplate['style'],
      primaryColor: template.primaryColor ? String(template.primaryColor) : undefined,
      accentColor: template.accentColor ? String(template.accentColor) : undefined,
      logo: template.logo as CertificateTemplate['logo'],
      backgroundImage: template.backgroundImage as CertificateTemplate['backgroundImage'],
      signatureName: template.signatureName ? String(template.signatureName) : undefined,
      signatureTitle: template.signatureTitle ? String(template.signatureTitle) : undefined,
      signatureImage: template.signatureImage as CertificateTemplate['signatureImage'],
      additionalText: template.additionalText ? String(template.additionalText) : undefined,
      credentialId: template.credentialId ? String(template.credentialId) : undefined,
    } : undefined,
    shareCount: Number(doc.shareCount || 0),
    verificationCount: Number(doc.verificationCount || 0),
    downloadCount: Number(doc.downloadCount || 0),
    isPublic: doc.isPublic !== false,
    createdAt: String(doc.createdAt || ''),
  };
}

export async function getCertificateById(certificateId: string): Promise<Certificate | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'certificates',
      where: {
        certificateId: {
          equals: certificateId,
        },
      },
      depth: 3,
    });

    if (result.docs.length === 0) {
      return null;
    }

    return formatCertificate(result.docs[0] as Record<string, unknown>);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return null;
  }
}

export async function listCertificatesForUser(userId: string): Promise<Certificate[]> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'certificates',
      where: {
        user: {
          equals: userId,
        },
      },
      depth: 3,
      sort: '-completionDate',
    });

    return result.docs.map((doc) => formatCertificate(doc as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching certificates for user:', error);
    return [];
  }
}

export async function incrementCertificateCount(
  certificateId: string,
  field: 'shareCount' | 'verificationCount' | 'downloadCount'
): Promise<void> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'certificates',
      where: {
        certificateId: {
          equals: certificateId,
        },
      },
      limit: 1,
    });

    if (result.docs.length === 0) {
      return;
    }

    const certificate = result.docs[0] as Record<string, unknown>;
    const currentCount = Number(certificate[field] || 0);

    await payload.update({
      collection: 'certificates',
      id: String(certificate.id),
      data: {
        [field]: currentCount + 1,
      },
    });
  } catch (error) {
    console.error(`Error incrementing ${field}:`, error);
  }
}

export async function getCertificateForCourse(
  userId: string,
  courseId: string
): Promise<Certificate | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'certificates',
      where: {
        and: [
          { user: { equals: userId } },
          { course: { equals: courseId } },
        ],
      },
      depth: 3,
      limit: 1,
    });

    if (result.docs.length === 0) {
      return null;
    }

    return formatCertificate(result.docs[0] as Record<string, unknown>);
  } catch (error) {
    console.error('Error fetching certificate for course:', error);
    return null;
  }
}

// Generate share URLs
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

// Template style configurations
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
