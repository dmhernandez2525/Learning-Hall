import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Learning Hall - Self-Hosted Course Platform',
    template: '%s | Learning Hall',
  },
  description:
    'Create and sell online courses with your own storage. Self-hostable, white-label, zero transaction fees.',
  keywords: [
    'online courses',
    'LMS',
    'learning management system',
    'self-hosted',
    'course platform',
    'BYOS',
    'bring your own storage',
  ],
  authors: [{ name: 'Learning Hall' }],
  creator: 'Learning Hall',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://learninghall.io',
    siteName: 'Learning Hall',
    title: 'Learning Hall - Self-Hosted Course Platform',
    description:
      'Create and sell online courses with your own storage. Self-hostable, white-label, zero transaction fees.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learning Hall - Self-Hosted Course Platform',
    description:
      'Create and sell online courses with your own storage. Self-hostable, white-label, zero transaction fees.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
