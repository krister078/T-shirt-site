'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PaymentMethodData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export function PaymentMethodSection() {
  const router = useRouter();
  const supabase = createClient();
  
  const [paymentData, setPaymentData] = useState<PaymentMethodData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing payment method on mount
  useEffect(() => {
    const loadPaymentMethod = async () => {
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

        // Fetch existing payment method
        const { data: paymentMethod, error: paymentError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        if (paymentMethod && !paymentError) {
          setPaymentData({
            cardNumber: '**** **** **** ' + paymentMethod.card_number_last4,
            expiryDate: paymentMethod.expiry_date,
            cvv: '', // Never pre-fill CVV for security
            cardholderName: paymentMethod.cardholder_name,
            billingAddress: {
              street: paymentMethod.billing_street || '',
              city: paymentMethod.billing_city || '',
              state: paymentMethod.billing_state || '',
              zipCode: paymentMethod.billing_zip_code || '',
              country: paymentMethod.billing_country || '',
            },
          });
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadPaymentMethod();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Extract last 4 digits of card number
      const cardNumberClean = paymentData.cardNumber.replace(/\s/g, '');
      const last4 = cardNumberClean.slice(-4);

      // Determine card type (basic detection)
      let cardType = 'unknown';
      if (cardNumberClean.startsWith('4')) cardType = 'visa';
      else if (cardNumberClean.startsWith('5')) cardType = 'mastercard';
      else if (cardNumberClean.startsWith('3')) cardType = 'amex';

      // Check if payment method already exists
      const { data: existingPayment } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      const paymentMethodData = {
        user_id: user.id,
        card_number_last4: last4,
        cardholder_name: paymentData.cardholderName,
        expiry_date: paymentData.expiryDate,
        card_type: cardType,
        billing_street: paymentData.billingAddress.street,
        billing_city: paymentData.billingAddress.city,
        billing_state: paymentData.billingAddress.state,
        billing_zip_code: paymentData.billingAddress.zipCode,
        billing_country: paymentData.billingAddress.country,
        is_default: true,
      };

      if (existingPayment) {
        // Update existing payment method
        const { error } = await supabase
          .from('payment_methods')
          .update(paymentMethodData)
          .eq('id', existingPayment.id);

        if (error) throw error;
      } else {
        // Insert new payment method
        const { error } = await supabase
          .from('payment_methods')
          .insert([paymentMethodData]);

        if (error) throw error;
      }

      setIsLoading(false);
      setIsEditing(false);
      setSuccessMessage('Payment method updated successfully!');
      
      // Update the display with masked card number
      setPaymentData(prev => ({
        ...prev,
        cardNumber: '**** **** **** ' + last4,
        cvv: '' // Clear CVV after saving
      }));
      
    } catch (error) {
      console.error('Error saving payment method:', error);
      setIsLoading(false);
      setSuccessMessage('Error saving payment method. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('billing.')) {
      const field = name.split('.')[1];
      setPaymentData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value,
        },
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

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
    setPaymentData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    });
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setPaymentData(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setPaymentData(prev => ({ ...prev, expiryDate: formatted }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setPaymentData(prev => ({ ...prev, cvv: value }));
    }
  };

  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return cardNumber;
    return '**** **** **** ' + cleaned.slice(-4);
  };

  if (isLoadingData) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Payment Method</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Payment Method</h2>
        {!isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            Edit Payment Method
          </Button>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Card Information</h3>
            
            <Input
              label="Cardholder Name"
              name="cardholderName"
              type="text"
              value={paymentData.cardholderName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />

            <Input
              label="Card Number"
              name="cardNumber"
              type="text"
              value={paymentData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                name="expiryDate"
                type="text"
                value={paymentData.expiryDate}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                required
              />
              <Input
                label="CVV"
                name="cvv"
                type="text"
                value={paymentData.cvv}
                onChange={handleCvvChange}
                placeholder="123"
                required
              />
            </div>
          </div>

          {/* Billing Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Billing Address</h3>
            
            <Input
              label="Street Address"
              name="billing.street"
              type="text"
              value={paymentData.billingAddress.street}
              onChange={handleChange}
              placeholder="ul. Vitosha 15"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                name="billing.city"
                type="text"
                value={paymentData.billingAddress.city}
                onChange={handleChange}
                placeholder="Sofia"
                required
              />
              <Input
                label="State/Province"
                name="billing.state"
                type="text"
                value={paymentData.billingAddress.state}
                onChange={handleChange}
                placeholder="Sofia City"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ZIP/Postal Code"
                name="billing.zipCode"
                type="text"
                value={paymentData.billingAddress.zipCode}
                onChange={handleChange}
                placeholder="1000"
                required
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country
                </label>
                <select
                  name="billing.country"
                  value={paymentData.billingAddress.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 bg-white"
                  required
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
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Payment Method'}
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
          {!paymentData.cardNumber && !paymentData.cardholderName ? (
            <p className="text-slate-600 italic">No payment method added yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Card Display */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm opacity-80">Credit Card</div>
                  <div className="flex space-x-1">
                    <div className="w-8 h-5 bg-white/20 rounded"></div>
                    <div className="w-8 h-5 bg-white/40 rounded"></div>
                  </div>
                </div>
                <div className="text-lg font-mono tracking-wider mb-4">
                  {maskCardNumber(paymentData.cardNumber) || '•••• •••• •••• ••••'}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs opacity-80">CARDHOLDER</div>
                    <div className="font-semibold">{paymentData.cardholderName || 'NAME'}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-80">EXPIRES</div>
                    <div className="font-semibold">{paymentData.expiryDate || 'MM/YY'}</div>
                  </div>
                </div>
              </div>

              {/* Billing Address Display */}
              {paymentData.billingAddress.street && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Billing Address</h4>
                  <div className="text-slate-600 text-sm">
                    <p>{paymentData.billingAddress.street}</p>
                    <p>{paymentData.billingAddress.city}, {paymentData.billingAddress.state} {paymentData.billingAddress.zipCode}</p>
                    <p>{paymentData.billingAddress.country}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
