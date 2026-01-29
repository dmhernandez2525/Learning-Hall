'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  MousePointerClick,
  ShoppingCart,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
} from 'lucide-react';

interface CustomLink {
  name: string;
  slug: string;
  destination?: string;
  clicks?: number;
  conversions?: number;
}

interface ShareLinksProps {
  affiliateCode: string;
  customLinks?: CustomLink[];
  baseUrl?: string;
  className?: string;
}

export function ShareLinks({
  affiliateCode,
  customLinks = [],
  baseUrl = typeof window !== 'undefined' ? window.location.origin : '',
  className,
}: ShareLinksProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const mainLink = `${baseUrl}?ref=${affiliateCode}`;

  const handleCopy = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(id);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const socialShareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(mainLink)}&text=${encodeURIComponent('Check out this amazing learning platform!')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(mainLink)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(mainLink)}`,
    email: `mailto:?subject=${encodeURIComponent('Check this out!')}&body=${encodeURIComponent(`I thought you might like this: ${mainLink}`)}`,
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Your Affiliate Links
        </CardTitle>
        <CardDescription>Share these links to earn commissions on referrals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Referral Link */}
        <div>
          <Label className="text-sm font-medium">Main Referral Link</Label>
          <div className="flex gap-2 mt-1.5">
            <Input value={mainLink} readOnly className="font-mono text-sm" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(mainLink, 'main')}
              className="shrink-0"
            >
              {copiedLink === 'main' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Use this link anywhere to track referrals with your code: <strong>{affiliateCode}</strong>
          </p>
        </div>

        {/* Quick Share Buttons */}
        <div>
          <Label className="text-sm font-medium">Quick Share</Label>
          <div className="flex gap-2 mt-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(socialShareUrls.twitter, '_blank')}
              className="flex-1"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(socialShareUrls.facebook, '_blank')}
              className="flex-1"
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(socialShareUrls.linkedin, '_blank')}
              className="flex-1"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(socialShareUrls.email, '_blank')}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </div>

        {/* Custom Links */}
        {customLinks.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Custom Tracking Links</Label>
            <div className="space-y-2">
              {customLinks.map((link, index) => {
                const fullUrl = `${baseUrl}${link.destination || ''}?ref=${affiliateCode}&link=${link.slug}`;
                const linkId = `custom-${index}`;

                return (
                  <div
                    key={linkId}
                    className="p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{link.name}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{fullUrl}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCopy(fullUrl, linkId)}
                        >
                          {copiedLink === linkId ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(fullUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="w-3 h-3" />
                        {link.clicks || 0} clicks
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        {link.conversions || 0} conversions
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
