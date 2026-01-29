import type { CollectionConfig } from 'payload';

// CSS property whitelist for safe customization
const SAFE_CSS_PROPERTIES = [
  'color', 'background-color', 'background', 'border-color', 'border-radius',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'width', 'max-width', 'min-width', 'height', 'max-height', 'min-height',
  'box-shadow', 'text-shadow', 'opacity', 'transition', 'transform',
];

// Patterns that indicate potentially malicious CSS
const DANGEROUS_PATTERNS = [
  /url\s*\(/i,           // No external resources
  /import/i,             // No @import
  /expression/i,         // No IE expressions
  /javascript:/i,        // No JS URLs
  /behavior/i,           // No IE behaviors
  /-moz-binding/i,       // No XBL bindings
  /data:/i,              // No data URLs
  /position\s*:\s*fixed/i, // No position fixed (could overlay UI)
];

function sanitizeCSS(css: string): string {
  if (!css) return '';

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(css)) {
      throw new Error(`CSS contains potentially unsafe content: ${pattern.source}`);
    }
  }

  // Basic length limit
  if (css.length > 50000) {
    throw new Error('CSS exceeds maximum length of 50000 characters');
  }

  return css;
}

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'plan', 'createdAt'],
    group: 'Admin',
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Sanitize custom CSS to prevent injection attacks
        if (data?.branding?.customCSS) {
          data.branding.customCSS = sanitizeCSS(data.branding.customCSS);
        }
        return data;
      },
    ],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      // Users can only see their own tenant
      return { id: { equals: req.user?.tenant } };
    },
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return { id: { equals: req.user?.tenant } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (used for subdomains)',
      },
    },
    {
      name: 'plan',
      type: 'select',
      required: true,
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'branding',
      type: 'group',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Main logo (recommended: 200x50px)' },
        },
        {
          name: 'logoDark',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Logo for dark backgrounds' },
        },
        {
          name: 'logoIcon',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Square icon/mark (for mobile, favicon)' },
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#14b8a6',
          admin: { description: 'Primary brand color (hex)' },
        },
        {
          name: 'secondaryColor',
          type: 'text',
          admin: { description: 'Secondary brand color (hex)' },
        },
        {
          name: 'accentColor',
          type: 'text',
          admin: { description: 'Accent color for highlights (hex)' },
        },
        {
          name: 'backgroundColor',
          type: 'text',
          admin: { description: 'Background color (hex)' },
        },
        {
          name: 'textColor',
          type: 'text',
          admin: { description: 'Primary text color (hex)' },
        },
        {
          name: 'fontFamily',
          type: 'select',
          options: [
            { label: 'System Default', value: 'system' },
            { label: 'Inter', value: 'inter' },
            { label: 'Roboto', value: 'roboto' },
            { label: 'Open Sans', value: 'open-sans' },
            { label: 'Lato', value: 'lato' },
            { label: 'Poppins', value: 'poppins' },
            { label: 'Montserrat', value: 'montserrat' },
          ],
          defaultValue: 'system',
        },
        {
          name: 'borderRadius',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
            { label: 'Full', value: 'full' },
          ],
          defaultValue: 'md',
        },
        {
          name: 'customCSS',
          type: 'code',
          admin: {
            language: 'css',
            description: 'Custom CSS to inject (advanced)',
          },
        },
        {
          name: 'hidePoweredBy',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Hide "Powered by Learning Hall" branding' },
        },
      ],
    },
    {
      name: 'domain',
      type: 'group',
      fields: [
        {
          name: 'custom',
          type: 'text',
          admin: { description: 'Custom domain (e.g., courses.example.com)' },
        },
        {
          name: 'verified',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Domain verification status' },
        },
        {
          name: 'sslEnabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'verifiedAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: { description: 'Default page title' },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: { description: 'Default meta description' },
        },
        {
          name: 'keywords',
          type: 'text',
          admin: { description: 'Comma-separated keywords' },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Default Open Graph image' },
        },
        {
          name: 'twitterHandle',
          type: 'text',
        },
        {
          name: 'googleAnalyticsId',
          type: 'text',
        },
        {
          name: 'facebookPixelId',
          type: 'text',
        },
      ],
    },
    {
      name: 'emails',
      type: 'group',
      admin: { description: 'Email customization' },
      fields: [
        {
          name: 'fromName',
          type: 'text',
          admin: { description: 'Sender name for emails' },
        },
        {
          name: 'fromEmail',
          type: 'email',
          admin: { description: 'Sender email address' },
        },
        {
          name: 'replyTo',
          type: 'email',
        },
        {
          name: 'headerLogo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'footerText',
          type: 'textarea',
          admin: { description: 'Custom footer text for emails' },
        },
        {
          name: 'templates',
          type: 'group',
          fields: [
            {
              name: 'welcome',
              type: 'richText',
              admin: { description: 'Welcome email template' },
            },
            {
              name: 'courseEnrollment',
              type: 'richText',
              admin: { description: 'Course enrollment confirmation' },
            },
            {
              name: 'certificateEarned',
              type: 'richText',
              admin: { description: 'Certificate earned notification' },
            },
            {
              name: 'passwordReset',
              type: 'richText',
              admin: { description: 'Password reset email' },
            },
          ],
        },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [
        {
          name: 'copyrightText',
          type: 'text',
          admin: { description: 'Copyright text (e.g., "© 2024 Company Name")' },
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          name: 'socialLinks',
          type: 'group',
          fields: [
            { name: 'facebook', type: 'text' },
            { name: 'twitter', type: 'text' },
            { name: 'instagram', type: 'text' },
            { name: 'linkedin', type: 'text' },
            { name: 'youtube', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'features',
      type: 'group',
      admin: { description: 'Feature toggles' },
      fields: [
        {
          name: 'enableDiscussions',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enableReviews',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enableCertificates',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enableGamification',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enableAffiliates',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'enableSubscriptions',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enableBundles',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enableCoupons',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'localization',
      type: 'group',
      fields: [
        {
          name: 'defaultLanguage',
          type: 'select',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Spanish', value: 'es' },
            { label: 'French', value: 'fr' },
            { label: 'German', value: 'de' },
            { label: 'Portuguese', value: 'pt' },
            { label: 'Chinese', value: 'zh' },
            { label: 'Japanese', value: 'ja' },
          ],
          defaultValue: 'en',
        },
        {
          name: 'enabledLanguages',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'English', value: 'en' },
            { label: 'Spanish', value: 'es' },
            { label: 'French', value: 'fr' },
            { label: 'German', value: 'de' },
            { label: 'Portuguese', value: 'pt' },
            { label: 'Chinese', value: 'zh' },
            { label: 'Japanese', value: 'ja' },
          ],
          defaultValue: ['en'],
        },
        {
          name: 'timezone',
          type: 'text',
          defaultValue: 'America/New_York',
        },
        {
          name: 'dateFormat',
          type: 'select',
          options: [
            { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
            { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
            { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
          ],
          defaultValue: 'MM/DD/YYYY',
        },
        {
          name: 'currency',
          type: 'select',
          options: [
            { label: 'USD ($)', value: 'usd' },
            { label: 'EUR (€)', value: 'eur' },
            { label: 'GBP (£)', value: 'gbp' },
            { label: 'CAD ($)', value: 'cad' },
            { label: 'AUD ($)', value: 'aud' },
          ],
          defaultValue: 'usd',
        },
      ],
    },
    {
      name: 'stripeAccountId',
      type: 'text',
      admin: {
        description: 'Stripe Connect account ID',
        position: 'sidebar',
      },
    },
    {
      name: 'settings',
      type: 'json',
      admin: {
        description: 'Additional tenant settings (JSON)',
      },
    },
  ],
  timestamps: true,
};
