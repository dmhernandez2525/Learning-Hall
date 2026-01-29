import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';

type RouteParams = {
  params: Promise<{
    certificateId: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { certificateId } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !['share', 'download', 'verify'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();

    // Find the certificate
    const { docs } = await payload.find({
      collection: 'certificates',
      where: {
        certificateId: { equals: certificateId },
      },
      limit: 1,
    });

    if (docs.length === 0) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    const certificate = docs[0];

    // Map action to field name
    const fieldMap: Record<string, string> = {
      share: 'shareCount',
      download: 'downloadCount',
      verify: 'verificationCount',
    };

    const field = fieldMap[action];
    const currentCount = Number(certificate[field] || 0);

    // Update the count
    await payload.update({
      collection: 'certificates',
      id: certificate.id,
      data: {
        [field]: currentCount + 1,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking certificate action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
