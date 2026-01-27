import Link from 'next/link';
import {
  Cloud,
  CreditCard,
  Lock,
  Palette,
  Server,
  Video,
  CheckCircle,
  ArrowRight,
  Github,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              LH
            </div>
            <span className="font-bold text-xl">Learning Hall</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full border px-3 py-1 text-sm">
              <span className="mr-2">🚀</span>
              <span>Open Source & Self-Hostable</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your courses.{' '}
              <span className="text-primary">Your storage.</span>
              <br />
              Your brand.
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Create and sell online courses with your own cloud storage.
              Self-hostable, white-label, zero transaction fees.
              Keep 100% of your revenue.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Start for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/dmhernandez2525/Learning-Hall"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border px-8 py-3 text-base font-medium transition-colors hover:bg-muted"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-24 bg-muted/50">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Everything you need to create courses
              </h2>
              <p className="text-lg text-muted-foreground">
                Built for creators who want full control over their content and data.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Cloud className="h-6 w-6" />}
                title="Bring Your Own Storage"
                description="Connect your AWS S3, Cloudflare R2, or any S3-compatible storage. Your content, your control."
              />
              <FeatureCard
                icon={<Palette className="h-6 w-6" />}
                title="True White-Label"
                description="No 'Powered by' badges. Custom domains, branding, and complete ownership of your platform."
              />
              <FeatureCard
                icon={<CreditCard className="h-6 w-6" />}
                title="Zero Transaction Fees"
                description="Keep 100% of your revenue. Only pay standard Stripe processing fees."
              />
              <FeatureCard
                icon={<Video className="h-6 w-6" />}
                title="HLS Video Streaming"
                description="Adaptive bitrate streaming for smooth playback on any device and connection."
              />
              <FeatureCard
                icon={<Server className="h-6 w-6" />}
                title="Self-Hostable"
                description="Deploy on your own infrastructure with Docker. Run it anywhere."
              />
              <FeatureCard
                icon={<Lock className="h-6 w-6" />}
                title="Privacy First"
                description="GDPR compliant. Your student data never leaves your control."
              />
            </div>
          </div>
        </section>

        {/* BYOS Comparison Section */}
        <section className="container py-24">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Why BYOS matters
              </h2>
              <p className="text-lg text-muted-foreground">
                Stop paying egress fees. Own your content forever.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold text-lg mb-4 text-muted-foreground">
                  Traditional LMS Platforms
                </h3>
                <ul className="space-y-3">
                  <ComparisonItem negative text="5-10% transaction fees" />
                  <ComparisonItem negative text="Content locked in their servers" />
                  <ComparisonItem negative text="Limited storage, expensive overages" />
                  <ComparisonItem negative text="Forced branding" />
                  <ComparisonItem negative text="No data portability" />
                </ul>
              </div>
              <div className="rounded-lg border-2 border-primary bg-card p-6">
                <h3 className="font-semibold text-lg mb-4 text-primary">
                  Learning Hall + BYOS
                </h3>
                <ul className="space-y-3">
                  <ComparisonItem text="0% transaction fees" />
                  <ComparisonItem text="Content in YOUR cloud storage" />
                  <ComparisonItem text="Unlimited storage at cloud prices" />
                  <ComparisonItem text="Complete white-label" />
                  <ComparisonItem text="Export everything, anytime" />
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Ready to own your course platform?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Start creating courses in minutes. Free to use, open source forever.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-base font-medium text-primary shadow transition-colors hover:bg-white/90"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  LH
                </div>
                <span className="font-bold">Learning Hall</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Self-hostable course platform with BYOS.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="https://github.com/dmhernandez2525/Learning-Hall" className="hover:text-foreground">GitHub</Link></li>
                <li><Link href="/docs/self-hosting" className="hover:text-foreground">Self-Hosting Guide</Link></li>
                <li><Link href="/docs/byos" className="hover:text-foreground">BYOS Setup</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Learning Hall. Open source under MIT license.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-lg">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function ComparisonItem({
  text,
  negative = false,
}: {
  text: string;
  negative?: boolean;
}) {
  return (
    <li className="flex items-center">
      <CheckCircle
        className={`mr-2 h-5 w-5 ${
          negative ? 'text-muted-foreground/50' : 'text-primary'
        }`}
      />
      <span className={negative ? 'text-muted-foreground' : ''}>{text}</span>
    </li>
  );
}
