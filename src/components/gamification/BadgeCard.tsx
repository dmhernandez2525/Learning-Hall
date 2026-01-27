'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

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

const rarityColors = {
  common: 'border-gray-300 bg-gray-50',
  uncommon: 'border-green-400 bg-green-50',
  rare: 'border-blue-500 bg-blue-50',
  epic: 'border-purple-500 bg-purple-50',
  legendary: 'border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50',
};

const rarityTextColors = {
  common: 'text-gray-600',
  uncommon: 'text-green-600',
  rare: 'text-blue-600',
  epic: 'text-purple-600',
  legendary: 'text-amber-600',
};

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
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

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 p-3 transition-all',
        rarityColors[rarity],
        isLocked && 'opacity-50 grayscale',
        onClick && 'cursor-pointer hover:scale-105',
        isNew && 'ring-2 ring-yellow-400 ring-offset-2'
      )}
      onClick={onClick}
    >
      {isNew && (
        <span className="absolute -top-2 -right-2 rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-white">
          NEW
        </span>
      )}

      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            'relative mb-2 flex items-center justify-center rounded-full border-2',
            sizeClasses[size],
            rarityColors[rarity]
          )}
        >
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt={name}
              fill
              className={cn('rounded-full object-cover', isLocked && 'opacity-30')}
            />
          ) : (
            <span className="text-3xl">{isEarned ? '🏆' : '🔒'}</span>
          )}
        </div>

        <h3 className={cn('font-semibold', size === 'sm' ? 'text-xs' : 'text-sm')}>{name}</h3>

        {size !== 'sm' && (
          <>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{description}</p>

            <div className={cn('mt-2 text-xs font-medium', rarityTextColors[rarity])}>
              {points} XP · {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </div>

            {inProgress && progress && (
              <div className="mt-2 w-full">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min((progress.current / progress.required) * 100, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {progress.current}/{progress.required}
                </p>
              </div>
            )}

            {isEarned && awardedAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                Earned {new Date(awardedAt).toLocaleDateString()}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
