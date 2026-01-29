'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Award, Lock, Trophy, Star, Sparkles, Crown } from 'lucide-react';

interface BadgeCardProps {
  name: string;
  description: string;
  iconUrl?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  isEarned?: boolean;
  isNew?: boolean;
  awardedAt?: string;
  progress?: {
    current: number;
    required: number;
  };
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const rarityConfig = {
  common: {
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    icon: Award,
    label: 'Common',
    glow: '',
  },
  uncommon: {
    border: 'border-green-400',
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: Award,
    label: 'Uncommon',
    glow: '',
  },
  rare: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: Star,
    label: 'Rare',
    glow: 'shadow-blue-200',
  },
  epic: {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: Sparkles,
    label: 'Epic',
    glow: 'shadow-purple-200',
  },
  legendary: {
    border: 'border-amber-500',
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
    text: 'text-amber-600',
    icon: Crown,
    label: 'Legendary',
    glow: 'shadow-amber-300',
  },
};

const sizeClasses = {
  sm: { container: 'w-16 h-16', icon: 'w-6 h-6', text: 'text-xl' },
  md: { container: 'w-20 h-20', icon: 'w-8 h-8', text: 'text-2xl' },
  lg: { container: 'w-28 h-28', icon: 'w-10 h-10', text: 'text-3xl' },
};

export function BadgeCard({
  name,
  description,
  iconUrl,
  rarity,
  points,
  isEarned = false,
  isNew = false,
  awardedAt,
  progress,
  size = 'md',
  onClick,
}: BadgeCardProps) {
  const isLocked = !isEarned && !progress;
  const inProgress = !isEarned && progress;
  const config = rarityConfig[rarity];
  const sizeConfig = sizeClasses[size];
  const progressPercent = progress ? Math.min((progress.current / progress.required) * 100, 100) : 0;
  const RarityIcon = config.icon;

  return (
    <div
      className={cn(
        'group relative rounded-xl border-2 p-4 transition-all duration-300',
        config.border,
        config.bg,
        isLocked && 'opacity-60 grayscale',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        isNew && 'ring-2 ring-yellow-400 ring-offset-2 animate-pulse',
        (rarity === 'epic' || rarity === 'legendary') && isEarned && `shadow-lg ${config.glow}`,
        rarity === 'legendary' && isEarned && 'animate-[shimmer_3s_ease-in-out_infinite]'
      )}
      onClick={onClick}
    >
      {/* Legendary shine effect */}
      {rarity === 'legendary' && isEarned && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      )}

      {/* New badge indicator */}
      {isNew && (
        <span className="absolute -top-2 -right-2 z-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
          NEW!
        </span>
      )}

      <div className="flex flex-col items-center text-center relative">
        {/* Badge Icon Container */}
        <div
          className={cn(
            'relative mb-3 flex items-center justify-center rounded-full border-2 transition-transform duration-300',
            sizeConfig.container,
            config.border,
            config.bg,
            isEarned && 'group-hover:scale-105',
            (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') && isEarned && 'shadow-lg'
          )}
        >
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt={name}
              fill
              className={cn('rounded-full object-cover', isLocked && 'opacity-30')}
            />
          ) : isLocked ? (
            <Lock className={cn('text-gray-400', sizeConfig.icon)} />
          ) : isEarned ? (
            <Trophy className={cn(config.text, sizeConfig.icon)} />
          ) : (
            <RarityIcon className={cn(config.text, sizeConfig.icon, 'opacity-60')} />
          )}

          {/* Earned checkmark */}
          {isEarned && (
            <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1 shadow">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Badge Name */}
        <h3 className={cn(
          'font-semibold leading-tight',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {name}
        </h3>

        {size !== 'sm' && (
          <>
            {/* Description */}
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>

            {/* Rarity and Points */}
            <div className={cn(
              'mt-2 flex items-center gap-1.5 text-xs font-medium',
              config.text
            )}>
              <RarityIcon className="w-3.5 h-3.5" />
              <span>{config.label}</span>
              <span className="text-muted-foreground">·</span>
              <span>{points} XP</span>
            </div>

            {/* Progress Bar */}
            {inProgress && progress && (
              <div className="mt-3 w-full">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      progressPercent >= 75 ? 'bg-green-500' :
                      progressPercent >= 50 ? 'bg-yellow-500' :
                      'bg-primary'
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                  {progress.current} / {progress.required}
                </p>
              </div>
            )}

            {/* Earned Date */}
            {isEarned && awardedAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                Earned {new Date(awardedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
