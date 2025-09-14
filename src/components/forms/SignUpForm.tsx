'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { calculatePasswordStrength } from '@/lib/passwordStrength';
import { createClient } from '@/lib/supabase/client';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  size: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  size?: string;
}

export function SignUpForm() {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    size: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordStrength = calculatePasswordStrength(formData.password);
      if (passwordStrength.score < 1) {
        newErrors.password = 'Password is too weak. Please make it at least mediocre.';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.size) {
      newErrors.size = 'Please select your t-shirt size';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Sign up with Supabase 
      // In development, we'll disable email confirmation since localhost can't receive emails
      const isProduction = process.env.NODE_ENV === 'production';
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            size: formData.size,
          },
          // Only use email confirmation in production
          ...(isProduction && {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          }),
        },
      });

      if (error) {
        console.error('Signup error:', error);
        setErrors({ email: error.message });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // User created successfully
        console.log('User created successfully:', data.user);
        
        // In development, go directly to dashboard since no email confirmation is needed
        // In production, go to check-email page
        if (isProduction) {
          router.push(`/auth/check-email?email=${encodeURIComponent(formData.email)}`);
        } else {
          // Development: go directly to dashboard
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setErrors({ email: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          placeholder="John"
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          placeholder="Doe"
          required
        />
      </div>

      <Input
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="john.doe@example.com"
        required
      />

      <Select
        label="T-Shirt Size"
        name="size"
        value={formData.size}
        onChange={handleChange}
        error={errors.size}
        placeholder="Select your size"
        options={[
          { value: 'XS', label: 'Extra Small (XS)' },
          { value: 'S', label: 'Small (S)' },
          { value: 'M', label: 'Medium (M)' },
          { value: 'L', label: 'Large (L)' },
          { value: 'XL', label: 'Extra Large (XL)' },
          { value: 'XXL', label: 'Double Extra Large (XXL)' },
          { value: 'XXXL', label: 'Triple Extra Large (XXXL)' },
        ]}
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Enter your password"
        showPasswordStrength={true}
        required
      />

      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
        required
      />

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-all duration-200 hover:underline"
          >
            Log in here
          </Link>
        </p>
      </div>
    </form>
  );
}
