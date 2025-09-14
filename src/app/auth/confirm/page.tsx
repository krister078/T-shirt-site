'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      if (!token_hash || type !== 'email') {
        setStatus('error');
        setMessage('Invalid confirmation link. Please try signing up again.');
        return;
      }

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email',
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage('Failed to confirm your email. The link may have expired.');
        } else if (data.user) {
          setStatus('success');
          setMessage('Your email has been confirmed successfully!');
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    confirmEmail();
  }, [searchParams, router, supabase]);

  const handleContinue = () => {
    if (status === 'success') {
      router.push('/dashboard');
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <AuthLayout
      title={status === 'loading' ? 'Confirming Email...' : status === 'success' ? 'Email Confirmed!' : 'Confirmation Failed'}
      subtitle={status === 'loading' ? 'Please wait while we confirm your email' : ''}
    >
      <div className="text-center space-y-6">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-600">Confirming your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Success!</h3>
              <p className="text-slate-600">{message}</p>
              <p className="text-sm text-slate-500 mt-2">Redirecting you to your profile...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Confirmation Failed</h3>
              <p className="text-slate-600">{message}</p>
            </div>
          </div>
        )}

        {status !== 'loading' && (
          <Button
            onClick={handleContinue}
            className="w-full"
          >
{status === 'success' ? 'Continue to Dashboard' : 'Back to Sign Up'}
          </Button>
        )}
      </div>
    </AuthLayout>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Confirming Email..." subtitle="Please wait">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </AuthLayout>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
