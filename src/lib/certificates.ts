import { getPayloadClient } from '@/lib/payload';

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
  };
  completionDate: string;
}

function formatCertificate(doc: Record<string, unknown>): Certificate {
  const user = doc.user as Record<string, unknown>;
  const course = doc.course as Record<string, unknown>;

  return {
    id: String(doc.id),
    certificateId: String(doc.certificateId),
    user: {
      id: String(user.id),
      name: user.name ? String(user.name) : undefined,
      email: String(user.email),
    },
    course: {
      id: String(course.id),
      title: String(course.title),
    },
    completionDate: String(doc.completionDate),
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
      depth: 2,
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
      depth: 2,
    });

    return result.docs.map((doc) => formatCertificate(doc as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching certificates for user:', error);
    return [];
  }
}
