'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const supabase = createClient();

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    setResendMessage('');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        setResendMessage('Failed to resend email. Please try again.');
      } else {
        setResendMessage('Confirmation email sent! Please check your inbox.');
      }
    } catch (error) {
      setResendMessage('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Check Your Email"
      subtitle="We've sent you a confirmation link"
    >
      <div className="text-center space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Confirmation Email Sent
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            We've sent a confirmation email to{' '}
            <span className="font-semibold text-slate-800">
              {email || 'your email address'}
            </span>
            . Please check your inbox and click the confirmation link to activate your account.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            <p className="mb-2">Didn't receive the email?</p>
            <ul className="text-left space-y-1 text-xs">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes for the email to arrive</li>
            </ul>
          </div>

          {resendMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              resendMessage.includes('sent') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {resendMessage}
            </div>
          )}

          <Button
            onClick={handleResendEmail}
            disabled={isResending || !email}
            variant="outline"
            className="w-full"
          >
            {isResending ? 'Sending...' : 'Resend Confirmation Email'}
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Already confirmed your email?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-all duration-200 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Check Your Email" subtitle="Loading...">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </AuthLayout>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}
