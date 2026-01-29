'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wallet, Clock, Banknote, ArrowRight } from 'lucide-react';

interface BalanceCardProps {
  balance: {
    available?: number;
    pending?: number;
    lifetime?: number;
  };
  minimumPayout?: number;
  onRequestPayout?: () => void;
  className?: string;
}

export function BalanceCard({
  balance,
  minimumPayout = 5000,
  onRequestPayout,
  className,
}: BalanceCardProps) {
  const available = balance.available || 0;
  const pending = balance.pending || 0;
  const lifetime = balance.lifetime || 0;

  const canRequestPayout = available >= minimumPayout;
  const progressToMinimum = Math.min((available / minimumPayout) * 100, 100);

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Your Balance
        </CardTitle>
        <CardDescription>Commission earnings and payout status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Balance */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Available Balance</p>
              <p className="text-3xl font-bold text-green-800 mt-1">
                {formatMoney(available)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-green-600" />
            </div>
          </div>

          {!canRequestPayout && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-700">Progress to minimum payout</span>
                <span className="text-green-600 font-medium">
                  {formatMoney(available)} / {formatMoney(minimumPayout)}
                </span>
              </div>
              <Progress value={progressToMinimum} className="h-2" />
              <p className="text-xs text-green-600 mt-1">
                {formatMoney(minimumPayout - available)} more to reach minimum payout
              </p>
            </div>
          )}

          {canRequestPayout && onRequestPayout && (
            <Button onClick={onRequestPayout} className="w-full mt-4 bg-green-600 hover:bg-green-700">
              Request Payout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Pending and Lifetime */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-xl font-bold text-amber-800">{formatMoney(pending)}</p>
            <p className="text-xs text-amber-600 mt-1">Clearing in 30 days</p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Lifetime</span>
            </div>
            <p className="text-xl font-bold text-blue-800">{formatMoney(lifetime)}</p>
            <p className="text-xs text-blue-600 mt-1">Total earned</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
