import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordStrength?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, showPasswordStrength, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-md disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-300',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50',
            className
          )}
          ref={ref}
          {...props}
        />
        {showPasswordStrength && props.type === 'password' && props.value && (
          <PasswordStrengthIndicator password={String(props.value)} />
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
