'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  size: string;
}

export function UserInfoSection() {
  const router = useRouter();
  const supabase = createClient();
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    size: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error fetching user:', error);
          router.push('/auth/login');
          return;
        }

        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Fetch user profile data from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, size')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          console.error('Profile fetch error details:', JSON.stringify(profileError, null, 2));
          // Fallback to user metadata if profile doesn't exist yet
          setUserData({
            firstName: user.user_metadata?.first_name || '',
            lastName: user.user_metadata?.last_name || '',
            email: user.email || '',
            size: user.user_metadata?.size || '',
          });
        } else {
          // Set user data from profiles table
          setUserData({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: user.email || '',
            size: profile.size || '',
          });
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        router.push('/auth/login');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update user metadata in Supabase
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          size: userData.size,
        }
      });

      if (authError) {
        console.error('Error updating auth metadata:', authError);
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          size: userData.size,
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        console.error('Profile error details:', JSON.stringify(profileError, null, 2));
        setSuccessMessage('');
        // You might want to show an error message here
        return;
      }

      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage('');
  };

  const handleCancel = async () => {
    setIsEditing(false);
    // Reset to original data from Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch fresh data from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, size')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserData({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: user.email || '',
            size: profile.size || '',
          });
        } else {
          // Fallback to user metadata
          setUserData({
            firstName: user.user_metadata?.first_name || '',
            lastName: user.user_metadata?.last_name || '',
            email: user.email || '',
            size: user.user_metadata?.size || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Show loading state while fetching user data
  if (isLoadingUser) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
        </div>
        <div className="space-y-3">
          <div>
            <div className="h-4 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 bg-slate-100 rounded animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 bg-slate-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
        {!isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              type="text"
              value={userData.firstName}
              onChange={handleChange}
              placeholder="John"
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              type="text"
              value={userData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
            />
          </div>

          <Select
            label="T-Shirt Size"
            name="size"
            value={userData.size}
            onChange={handleChange}
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
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <div className="flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed">
              {userData.email}
            </div>
            <p className="text-xs text-slate-500">Email address cannot be changed</p>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
            <p className="text-slate-800 text-lg">{userData.firstName} {userData.lastName}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <p className="text-slate-600">{userData.email}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">T-Shirt Size</label>
            <p className="text-slate-600">{userData.size || 'Not specified'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
