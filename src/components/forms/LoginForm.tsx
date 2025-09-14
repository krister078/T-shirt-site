'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          setErrors({ 
            email: 'Please check your email and click the confirmation link, or contact support if you need help.' 
          });
        } else if (error.message.includes('Invalid login credentials')) {
          setErrors({ 
            email: 'Invalid email or password. Please check your credentials and try again.' 
          });
        } else {
          setErrors({ email: error.message });
        }
        
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // User logged in successfully
        console.log('User logged in successfully:', data.user);
        // Redirect to dashboard page
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setErrors({ email: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleForgotPassword = () => {
    // Placeholder for forgot password functionality
    alert('Forgot password functionality will be implemented soon!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Enter your password"
        required
      />

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleForgotPassword}
          className="text-blue-600 hover:text-blue-700 p-0 h-auto font-semibold hover:underline shadow-none"
        >
          Forgot your password?
        </Button>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
{isLoading ? 'Logging In...' : 'Log In'}
      </Button>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-all duration-200 hover:underline"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </form>
  );
}
