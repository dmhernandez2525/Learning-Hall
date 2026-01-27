import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Learning Hall',
  description: 'Sign in or create an account for Learning Hall',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
