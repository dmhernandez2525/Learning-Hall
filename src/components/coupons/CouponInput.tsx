'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tag, Loader2, Check, X } from 'lucide-react';

interface AppliedCoupon {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

interface CouponInputProps {
  purchaseAmount: number;
  purchaseType: 'course' | 'subscription' | 'bundle';
  itemId?: string;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
  appliedCoupon?: AppliedCoupon | null;
  className?: string;
}

export function CouponInput({
  purchaseAmount,
  purchaseType,
  itemId,
  onApply,
  onRemove,
  appliedCoupon,
  className,
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleApply = () => {
    if (!code.trim()) return;

    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code.trim(),
            purchaseAmount,
            purchaseType,
            itemId,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.valid) {
          setError(data.error || 'Invalid coupon code');
          return;
        }

        onApply({
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          discountAmount: data.discountAmount,
        });

        setCode('');
      } catch {
        setError('Failed to validate coupon');
      }
    });
  };

  const handleRemove = () => {
    onRemove();
    setError(null);
  };

  const formatDiscount = (coupon: AppliedCoupon) => {
    if (coupon.discountType === 'percent') {
      return `${coupon.discountValue}% off`;
    }
    return `$${(coupon.discountValue / 100).toFixed(2)} off`;
  };

  const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  // If coupon is already applied, show it
  if (appliedCoupon) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800 flex items-center gap-1">
                <Tag className="w-4 h-4" />
                {appliedCoupon.code}
              </p>
              <p className="text-sm text-green-600">
                {formatDiscount(appliedCoupon)} ({formatAmount(appliedCoupon.discountAmount)} saved)
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-green-700 hover:text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter coupon code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="pl-9 uppercase"
            disabled={pending}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={pending || !code.trim()}
          variant="outline"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
