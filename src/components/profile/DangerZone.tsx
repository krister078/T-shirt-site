'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

export function DangerZone() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await signOut();
      console.log('User logged out');
      // The middleware will handle the redirect to login
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    // Simulate delete account API call
    setTimeout(() => {
      console.log('Account deleted');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      // Here you would typically make an API call to delete the account
      alert('Account deleted successfully. You will be redirected to the homepage.');
      router.push('/auth/signup');
    }, 2000);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-200/50 shadow-xl p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-red-800 mb-2">Account Actions</h2>
        <p className="text-red-600 text-sm">
          These actions are permanent and cannot be undone.
        </p>
      </div>

      <div className="space-y-4">
        {/* Logout Section */}
        <div className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-red-200">
          <div>
            <h3 className="font-semibold text-slate-800">Sign Out</h3>
            <p className="text-sm text-slate-600">Sign out of your account on this device.</p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/40"
          >
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>

        {/* Delete Account Section */}
        <div className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-red-200">
          <div>
            <h3 className="font-semibold text-slate-800">Delete Account</h3>
            <p className="text-sm text-slate-600">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <Button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="bg-red-700 hover:bg-red-800 text-white border-red-700 hover:border-red-800 shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/40"
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Account</h3>
              <p className="text-slate-600 mb-4">
                Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove:
              </p>
              <ul className="text-left text-sm text-slate-600 mb-6 space-y-1">
                <li>• Your profile information</li>
                <li>• All your t-shirt designs</li>
                <li>• Your order history</li>
                <li>• All associated data</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={cancelDelete}
                variant="outline"
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
