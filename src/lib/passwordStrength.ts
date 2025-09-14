export interface PasswordStrength {
  score: number; // 0-3 (weak, mediocre, good, strong)
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: 'red' | 'orange' | 'yellow' | 'green';
  requirements: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
  missingRequirements: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  
  let score = 0;
  let label: PasswordStrength['label'] = 'Weak';
  let color: PasswordStrength['color'] = 'red';

  if (metRequirements >= 5) {
    score = 3;
    label = 'Strong';
    color = 'green';
  } else if (metRequirements >= 4) {
    score = 2;
    label = 'Good';
    color = 'yellow';
  } else if (metRequirements >= 2) {
    score = 1;
    label = 'Fair';
    color = 'orange';
  }

  const missingRequirements: string[] = [];
  if (!requirements.length) missingRequirements.push('At least 8 characters');
  if (!requirements.lowercase) missingRequirements.push('One lowercase letter');
  if (!requirements.uppercase) missingRequirements.push('One uppercase letter');
  if (!requirements.number) missingRequirements.push('One number');
  if (!requirements.special) missingRequirements.push('One special character');

  return {
    score,
    label,
    color,
    requirements,
    missingRequirements,
  };
}
