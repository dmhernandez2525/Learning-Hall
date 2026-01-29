'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Certificate, CertificateTemplate } from '@/lib/certificates-client';
import { templateStyles, generateShareUrls, trackCertificateAction } from '@/lib/certificates-client';
import { Download, Share2, Twitter, Linkedin, Mail, Link2, CheckCircle2 } from 'lucide-react';

interface CertificateDisplayProps {
  certificate: Certificate;
  baseUrl?: string;
  showActions?: boolean;
}

function getTemplateStyle(template?: CertificateTemplate) {
  const style = template?.style || 'classic';
  const baseStyle = templateStyles[style] || templateStyles.classic;

  return {
    primaryColor: template?.primaryColor || baseStyle.defaultPrimaryColor,
    accentColor: template?.accentColor || baseStyle.defaultAccentColor,
    fontFamily: baseStyle.fontFamily,
    borderStyle: baseStyle.borderStyle,
  };
}

function ClassicTemplate({ certificate, style }: { certificate: Certificate; style: ReturnType<typeof getTemplateStyle> }) {
  return (
    <div
      className="w-full aspect-[1.414] bg-white p-8 relative"
      style={{
        fontFamily: style.fontFamily,
        border: style.borderStyle,
        borderColor: style.primaryColor,
      }}
    >
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4" style={{ borderColor: style.accentColor }} />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4" style={{ borderColor: style.accentColor }} />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4" style={{ borderColor: style.accentColor }} />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4" style={{ borderColor: style.accentColor }} />

      <div className="text-center space-y-6 py-8">
        <div className="uppercase tracking-[0.3em] text-sm" style={{ color: style.accentColor }}>
          Certificate of Completion
        </div>

        <h1 className="text-4xl font-bold" style={{ color: style.primaryColor }}>
          {certificate.course.title}
        </h1>

        <div className="text-lg text-gray-600">
          This is to certify that
        </div>

        <div
          className="text-3xl font-semibold py-4 border-b-2 mx-auto inline-block px-8"
          style={{ borderColor: style.accentColor, color: style.primaryColor }}
        >
          {certificate.user.name || certificate.user.email}
        </div>

        <div className="text-lg text-gray-600">
          has successfully completed all requirements
          <br />
          for this course on
        </div>

        <div className="text-xl font-medium" style={{ color: style.primaryColor }}>
          {new Date(certificate.completionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>

        {certificate.template?.additionalText && (
          <div className="text-sm text-gray-500 italic mt-4">
            {certificate.template.additionalText}
          </div>
        )}

        <div className="flex justify-between items-end mt-12 px-8">
          <div className="text-center">
            {certificate.template?.signatureImage?.url ? (
              <img
                src={certificate.template.signatureImage.url}
                alt="Signature"
                className="h-12 mx-auto mb-2"
              />
            ) : (
              <div className="h-12 border-b border-gray-400 w-40 mb-2" />
            )}
            <div className="text-sm font-medium" style={{ color: style.primaryColor }}>
              {certificate.template?.signatureName || certificate.course.instructor?.name || 'Instructor'}
            </div>
            <div className="text-xs text-gray-500">
              {certificate.template?.signatureTitle || 'Course Instructor'}
            </div>
          </div>

          <div className="text-right text-xs text-gray-400">
            <div>Certificate ID: {certificate.certificateId}</div>
            {certificate.template?.credentialId && (
              <div>Credential: {certificate.template.credentialId}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModernTemplate({ certificate, style }: { certificate: Certificate; style: ReturnType<typeof getTemplateStyle> }) {
  return (
    <div
      className="w-full aspect-[1.414] bg-white relative overflow-hidden"
      style={{ fontFamily: style.fontFamily }}
    >
      {/* Accent bar */}
      <div className="h-2 w-full" style={{ backgroundColor: style.primaryColor }} />

      <div className="p-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Certificate of Completion</div>
            <h1 className="text-2xl font-bold" style={{ color: style.primaryColor }}>
              {certificate.course.title}
            </h1>
          </div>
          {certificate.template?.logo?.url && (
            <img src={certificate.template.logo.url} alt="Logo" className="h-12" />
          )}
        </div>

        <div className="my-12">
          <div className="text-sm text-gray-500 mb-2">Awarded to</div>
          <div className="text-4xl font-light" style={{ color: style.primaryColor }}>
            {certificate.user.name || certificate.user.email}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-auto">
          <div>
            <div className="text-sm text-gray-500 mb-1">Date of Completion</div>
            <div className="font-medium">
              {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Certificate ID</div>
            <div className="font-mono text-sm">{certificate.certificateId}</div>
          </div>
        </div>

        {certificate.template?.additionalText && (
          <div className="mt-8 text-sm text-gray-600 border-l-4 pl-4" style={{ borderColor: style.accentColor }}>
            {certificate.template.additionalText}
          </div>
        )}

        <div className="mt-12 pt-8 border-t" style={{ borderColor: style.accentColor }}>
          <div className="flex items-center gap-4">
            {certificate.template?.signatureImage?.url && (
              <img src={certificate.template.signatureImage.url} alt="Signature" className="h-10" />
            )}
            <div>
              <div className="font-medium" style={{ color: style.primaryColor }}>
                {certificate.template?.signatureName || certificate.course.instructor?.name || 'Instructor'}
              </div>
              <div className="text-sm text-gray-500">
                {certificate.template?.signatureTitle || 'Course Instructor'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalTemplate({ certificate, style }: { certificate: Certificate; style: ReturnType<typeof getTemplateStyle> }) {
  return (
    <div
      className="w-full aspect-[1.414] bg-white p-16 flex flex-col justify-center"
      style={{ fontFamily: style.fontFamily }}
    >
      <div className="text-center space-y-8">
        <div className="text-xs uppercase tracking-[0.5em] text-gray-400">
          Certificate
        </div>

        <div className="space-y-4">
          <div className="text-5xl font-extralight" style={{ color: style.primaryColor }}>
            {certificate.user.name || certificate.user.email}
          </div>

          <div className="text-sm text-gray-500">
            completed
          </div>

          <div className="text-2xl font-medium" style={{ color: style.primaryColor }}>
            {certificate.course.title}
          </div>
        </div>

        <div className="text-sm text-gray-400">
          {new Date(certificate.completionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>

        <div className="pt-8 text-xs text-gray-300">
          {certificate.certificateId}
        </div>
      </div>
    </div>
  );
}

export function CertificateDisplay({ certificate, baseUrl = '', showActions = true }: CertificateDisplayProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const style = getTemplateStyle(certificate.template);
  const shareUrls = generateShareUrls(certificate, baseUrl || (typeof window !== 'undefined' ? window.location.origin : ''));

  const handleDownload = async () => {
    if (!certificateRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`certificate-${certificate.certificateId}.pdf`);

      // Track download
      await trackCertificateAction(certificate.certificateId, 'download');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'email' | 'copy') => {
    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrls.verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }

    // Track share
    await trackCertificateAction(certificate.certificateId, 'share');
  };

  const templateStyle = certificate.template?.style || 'classic';

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div ref={certificateRef}>
          {templateStyle === 'modern' && <ModernTemplate certificate={certificate} style={style} />}
          {templateStyle === 'minimal' && <MinimalTemplate certificate={certificate} style={style} />}
          {(templateStyle === 'classic' || templateStyle === 'professional' || templateStyle === 'elegant') && (
            <ClassicTemplate certificate={certificate} style={style} />
          )}
        </div>
      </Card>

      {showActions && (
        <div className="flex justify-center gap-4">
          <Button onClick={handleDownload} disabled={isDownloading}>
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleShare('twitter')}>
                <Twitter className="w-4 h-4 mr-2" />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                <Linkedin className="w-4 h-4 mr-2" />
                Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('email')}>
                <Mail className="w-4 h-4 mr-2" />
                Share via Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('copy')}>
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

// Simple card component for listing certificates
export function CertificateCard({ certificate, onClick }: { certificate: Certificate; onClick?: () => void }) {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{certificate.course.title}</h3>
          <p className="text-sm text-muted-foreground">
            Completed {new Date(certificate.completionDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
