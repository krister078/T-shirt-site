import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm',
          {
            'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus-visible:ring-blue-500 shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 active:scale-[0.98]': variant === 'primary',
            'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-500 hover:shadow-md': variant === 'secondary',
            'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-500 hover:border-blue-300 hover:shadow-md': variant === 'outline',
            'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-500 hover:text-slate-700': variant === 'ghost',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-6 py-3': size === 'md',
            'h-12 px-8 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
