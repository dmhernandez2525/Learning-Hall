import { getCertificateById, incrementCertificateCount } from '@/lib/certificates';
import { notFound } from 'next/navigation';
import { CertificateDisplay } from '@/components/courses/Certificate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Calendar, User, BookOpen, Shield } from 'lucide-react';

type PageProps = {
  params: Promise<{
    certificateId: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { certificateId } = await params;
  const certificate = await getCertificateById(certificateId);

  if (!certificate) {
    return {
      title: 'Certificate Not Found',
    };
  }

  return {
    title: `Certificate - ${certificate.course.title}`,
    description: `Verified certificate of completion for ${certificate.course.title} issued to ${certificate.user.name || 'a student'}.`,
    openGraph: {
      title: `Certificate of Completion - ${certificate.course.title}`,
      description: `${certificate.user.name || 'A student'} has completed "${certificate.course.title}".`,
      type: 'website',
    },
  };
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { certificateId } = await params;
  const certificate = await getCertificateById(certificateId);

  if (!certificate) {
    notFound();
  }

  // Check if certificate is public
  if (!certificate.isPublic) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Certificate is Private</h1>
            <p className="text-muted-foreground">
              This certificate has been set to private by its owner and cannot be publicly verified.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Track verification (server-side)
  await incrementCertificateCount(certificateId, 'verificationCount');

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Verification Badge */}
        <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Verified Certificate
                </h2>
                <p className="text-green-600 dark:text-green-400">
                  This certificate is authentic and has been verified.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Display */}
        <CertificateDisplay certificate={certificate} showActions={true} />

        {/* Certificate Details */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Recipient</div>
                  <div className="font-medium">{certificate.user.name || certificate.user.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Course</div>
                  <div className="font-medium">{certificate.course.title}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Completion Date</div>
                  <div className="font-medium">
                    {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Certificate ID</div>
                  <div className="font-mono text-sm">{certificate.certificateId}</div>
                </div>
              </div>
            </div>

            {certificate.course.instructor?.name && (
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground mb-1">Instructor</div>
                <div className="font-medium">{certificate.course.instructor.name}</div>
              </div>
            )}

            {certificate.template?.credentialId && (
              <div className="mt-4">
                <div className="text-sm text-muted-foreground mb-1">Credential ID</div>
                <div className="font-mono text-sm">{certificate.template.credentialId}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics (optional) */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            This certificate has been verified {certificate.verificationCount + 1} time{certificate.verificationCount !== 0 ? 's' : ''}.
          </p>
        </div>
      </div>
    </div>
  );
}
