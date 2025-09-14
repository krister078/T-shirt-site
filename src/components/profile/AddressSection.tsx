'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export function AddressSection() {
  const [addressData, setAddressData] = useState<AddressData>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Address data:', addressData);
      setIsLoading(false);
      setIsEditing(false);
      setSuccessMessage('Address updated successfully!');
      // Here you would typically make an API call to save the address
    }, 1000);
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

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data (in real app, you'd fetch from server)
    setAddressData({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    });
  };

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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
