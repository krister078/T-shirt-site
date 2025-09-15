'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export function AddressSection() {
  const router = useRouter();
  const supabase = createClient();
  
  const [addressData, setAddressData] = useState<AddressData>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing address on component mount
  useEffect(() => {
    const loadAddress = async () => {
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

        // Fetch existing address
        const { data: addressRecord, error: addressError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (addressRecord && !addressError) {
          setAddressData({
            street: addressRecord.street || '',
            city: addressRecord.city || '',
            state: addressRecord.state || '',
            zipCode: addressRecord.zip_code || '',
            country: addressRecord.country || '',
            phone: addressRecord.phone || '',
          });
        }
      } catch (error) {
        console.error('Unexpected error loading address:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAddress();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form data
      if (!addressData.street || !addressData.city || !addressData.state || !addressData.zipCode || !addressData.country) {
        alert('Please fill in all required address fields');
        setIsLoading(false);
        return;
      }

      // Phone number validation (Bulgarian format: 10 digits)
      if (addressData.phone) {
        const phoneDigits = addressData.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
          alert('Please enter a valid 10-digit phone number (e.g., 0812345678)');
          setIsLoading(false);
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please log in to save your address');
        return;
      }

      const addressPayload = {
        user_id: user.id,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.zipCode,
        country: addressData.country,
        phone: addressData.phone,
      };

      // Check if address already exists
      const { data: existingAddress } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update(addressPayload)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new address
        const { error } = await supabase
          .from('addresses')
          .insert(addressPayload);

        if (error) throw error;
      }

      setIsEditing(false);
      setSuccessMessage('Address updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
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
    setSuccessMessage('');
    
    // Reset to original data from database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: addressRecord } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (addressRecord) {
          setAddressData({
            street: addressRecord.street || '',
            city: addressRecord.city || '',
            state: addressRecord.state || '',
            zipCode: addressRecord.zip_code || '',
            country: addressRecord.country || '',
            phone: addressRecord.phone || '',
          });
        } else {
          // No saved address, reset to empty
          setAddressData({
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            phone: '',
          });
        }
      }
    } catch (error) {
      console.error('Error resetting address data:', error);
    }
  };

  // Show loading state while fetching address data
  if (isLoadingData) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Address Information</h2>
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
        <h2 className="text-xl font-bold text-slate-800">Address Information</h2>
        {!isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            Edit Address
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
          <Input
            label="Street Address"
            name="street"
            type="text"
            value={addressData.street}
            onChange={handleChange}
            placeholder="ul. Vitosha 15"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              type="text"
              value={addressData.city}
              onChange={handleChange}
              placeholder="Sofia"
            />
            <Input
              label="State/Province"
              name="state"
              type="text"
              value={addressData.state}
              onChange={handleChange}
              placeholder="Sofia City"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ZIP/Postal Code"
              name="zipCode"
              type="text"
              value={addressData.zipCode}
              onChange={handleChange}
              placeholder="1000"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Country
              </label>
              <select
                name="country"
                value={addressData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 bg-white"
              >
                <option value="">Select a country</option>
                <option value="Bulgaria">Bulgaria</option>
                <option value="Romania">Romania</option>
                <option value="Serbia">Serbia</option>
                <option value="North Macedonia">North Macedonia</option>
                <option value="Greece">Greece</option>
                <option value="Albania">Albania</option>
                <option value="Croatia">Croatia</option>
                <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                <option value="Montenegro">Montenegro</option>
                <option value="Slovenia">Slovenia</option>
                <option value="Kosovo">Kosovo</option>
              </select>
            </div>
          </div>

          <Input
            label="Phone Number (10 digits)"
            name="phone"
            type="tel"
            value={addressData.phone}
            onChange={handleChange}
            placeholder="0812345678"
          />

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Address'}
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
          {!addressData.street && !addressData.city ? (
            <p className="text-slate-600 italic">No address information added yet.</p>
          ) : (
            <div className="text-slate-700">
              <p>{addressData.street}</p>
              <p>{addressData.city}, {addressData.state} {addressData.zipCode}</p>
              <p>{addressData.country}</p>
              {addressData.phone && <p>Phone: {addressData.phone}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
