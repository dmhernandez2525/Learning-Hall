'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutButtonProps {
  courseId: string;
  price: number;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  label?: string;
  showPrice?: boolean;
  fullWidth?: boolean;
}

export function CheckoutButton({
  courseId,
  price,
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  label = 'Enroll Now',
  showPrice = true,
  fullWidth = false,
}: CheckoutButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

  const handleCheckout = () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Checkout failed');
        console.error('Checkout error:', err);
      }
    });
  };

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full')}>
      <Button
        onClick={handleCheckout}
        disabled={disabled || pending}
        variant={variant}
        size={size}
        className={cn(
          'relative transition-all duration-200',
          fullWidth && 'w-full',
          pending && 'opacity-80',
          className
        )}
      >
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            {label}
            {showPrice && price > 0 && (
              <span className="ml-2 font-bold">{formattedPrice}</span>
            )}
          </>
        )}
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>Secure checkout powered by Stripe</span>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
