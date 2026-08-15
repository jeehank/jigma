import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'link' | 'ghost' | 'outline';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', asChild = false, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all rounded-xl focus:outline-none disabled:opacity-50 text-sm py-2.5 px-4 cursor-pointer';
    
    let variantStyles = 'bg-white text-black hover:bg-gray-200 shadow-md font-semibold';
    if (variant === 'link') {
      variantStyles = 'bg-transparent text-white underline-offset-4 hover:underline p-0 h-auto font-normal';
    } else if (variant === 'ghost') {
      variantStyles = 'bg-white/10 text-white hover:bg-white/20 border border-white/20';
    } else if (variant === 'outline') {
      variantStyles = 'bg-transparent text-white border border-white/30 hover:bg-white/10';
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(base, variantStyles, className, (children.props as any).className),
      });
    }

    return (
      <button ref={ref} className={cn(base, variantStyles, className)} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
