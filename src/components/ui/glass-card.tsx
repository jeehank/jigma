import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-2xl text-white',
        className
      )}
      {...props}
    />
  )
);
GlassCard.displayName = 'GlassCard';

export const GlassCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 pb-4 relative', className)} {...props} />
  )
);
GlassCardHeader.displayName = 'GlassCardHeader';

export const GlassCardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-bold tracking-tight text-white', className)} {...props} />
  )
);
GlassCardTitle.displayName = 'GlassCardTitle';

export const GlassCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs text-gray-300', className)} {...props} />
  )
);
GlassCardDescription.displayName = 'GlassCardDescription';

export const GlassCardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('absolute right-0 top-0 text-sm font-medium', className)} {...props} />
  )
);
GlassCardAction.displayName = 'GlassCardAction';

export const GlassCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('py-2', className)} {...props} />
  )
);
GlassCardContent.displayName = 'GlassCardContent';

export const GlassCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
  )
);
GlassCardFooter.displayName = 'GlassCardFooter';
