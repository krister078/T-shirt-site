'use client';

import { useState } from 'react';
import { calculatePasswordStrength, type PasswordStrength } from '@/lib/passwordStrength';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  const getColorClasses = (color: PasswordStrength['color']) => {
    switch (color) {
      case 'red':
        return 'bg-red-500 border-red-200';
      case 'orange':
        return 'bg-orange-500 border-orange-200';
      case 'yellow':
        return 'bg-yellow-500 border-yellow-200';
      case 'green':
        return 'bg-green-500 border-green-200';
      default:
        return 'bg-gray-300 border-gray-200';
    }
  };

  const getTextColorClasses = (color: PasswordStrength['color']) => {
    switch (color) {
      case 'red':
        return 'text-red-600';
      case 'orange':
        return 'text-orange-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'green':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={cn('relative flex items-center gap-2 mt-2', className)}>
      {/* Strength Dot */}
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          className={cn(
            'w-3 h-3 rounded-full border-2 transition-all duration-200 cursor-help',
            getColorClasses(strength.color)
          )}
        />
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
            <div className="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg max-w-xs">
              <div className="font-semibold mb-1">Password Requirements:</div>
              <ul className="space-y-1">
                {strength.missingRequirements.length > 0 ? (
                  strength.missingRequirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <span className="text-red-400">✗</span>
                      <span>{req}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-center gap-1 text-green-400">
                    <span>✓</span>
                    <span>All requirements met!</span>
                  </li>
                )}
              </ul>
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        )}
      </div>

      {/* Strength Label */}
      <span className={cn('text-xs font-medium', getTextColorClasses(strength.color))}>
        {strength.label}
      </span>
    </div>
  );
}
