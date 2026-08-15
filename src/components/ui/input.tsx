import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-sm transition-all',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
