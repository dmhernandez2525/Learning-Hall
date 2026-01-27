import { getCertificateById } from '@/lib/certificates';
import { Certificate } from '@/lib/certificates';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PageProps = {
  params: {
    certificateId: string;
  };
};

function CertificateDetails({ certificate }: { certificate: Certificate }) {
  return (
    <Card className="max-w-4xl mx-auto">
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
  );
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { certificateId } = params;
  const certificate = await getCertificateById(certificateId);

  if (!certificate) {
    notFound();
  }

  return (
    <div className="container py-12">
      <CertificateDetails certificate={certificate} />
    </div>
  );
}
