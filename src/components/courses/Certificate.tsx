'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Certificate } from '@/lib/certificates';

export function CertificateDisplay({ certificate }: { certificate: Certificate }) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`certificate-${certificate.certificateId}.pdf`);
  };

  return (
    <div>
      <div ref={certificateRef} className="p-8 bg-white text-black">
        <Card className="max-w-4xl mx-auto border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">Certificate of Completion</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-xl">This is to certify that</p>
            <h2 className="text-4xl font-semibold">{certificate.user.name || certificate.user.email}</h2>
            <p className="text-xl">has successfully completed the course</p>
            <h3 className="text-3xl font-medium">{certificate.course.title}</h3>
            <p className="text-lg">on {new Date(certificate.completionDate).toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground pt-6">
              Certificate ID: {certificate.certificateId}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="text-center mt-4">
        <Button onClick={handleDownload}>Download Certificate</Button>
      </div>
    </div>
  );
}
