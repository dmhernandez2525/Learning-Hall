'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both';
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = 'vertical', ...props }, ref) => {
    const scrollClassName = cn(
      'relative',
      orientation === 'vertical' && 'overflow-y-auto overflow-x-hidden',
      orientation === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
      orientation === 'both' && 'overflow-auto',
      className
    );

    return (
      <div ref={ref} className={scrollClassName} {...props}>
        {children}
      </div>
    );
  }
);
ScrollArea.displayName = 'ScrollArea';

const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: 'vertical' | 'horizontal' }
>(({ className, orientation = 'vertical', ...props }, ref) => {
  // This is a placeholder for styling consistency
  // The actual scrollbar is handled by the browser
  return (
    <div
      ref={ref}
      className={cn(
        'flex touch-none select-none transition-colors',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-[1px]',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent p-[1px]',
        className
      )}
      {...props}
    />
  );
});
ScrollBar.displayName = 'ScrollBar';

export { ScrollArea, ScrollBar };
