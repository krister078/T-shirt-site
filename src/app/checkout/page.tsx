'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';

interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
}

interface PaymentMethod {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Address state
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Bulgaria',
    phone: ''
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [hasExistingAddress, setHasExistingAddress] = useState(false);
  
  // Payment state
  const [payment, setPayment] = useState<PaymentMethod>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [, setHasExistingPayment] = useState(false);

  const totalItems = getTotalItems();
  const subtotalPrice = getTotalPrice();
  const shippingCost = 5.99;
  const totalPrice = subtotalPrice + shippingCost;

  // Load existing address and payment method on mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Load existing address
          const { data: addressData } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (addressData) {
            setAddress({
              street: addressData.street || '',
              city: addressData.city || '',
              state: addressData.state || '',
              zip_code: addressData.zip_code || '',
              country: addressData.country || 'Bulgaria',
              phone: addressData.phone || ''
            });
            setHasExistingAddress(true);
            setSaveAddress(true); // Default to saving if they already have an address
          }

          // Load existing payment method
          const { data: paymentData } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_default', true)
            .single();
          
          if (paymentData) {
            setPayment({
              cardNumber: '**** **** **** ' + paymentData.card_number_last4,
              expiryDate: paymentData.expiry_date,
              cvv: '', // Never pre-fill CVV for security
              cardholderName: paymentData.cardholder_name
            });
            setHasExistingPayment(true);
          }
        }
      } catch (error) {
        console.error('Error loading existing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingData();
  }, [supabase]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, loading, router]);

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentChange = (field: keyof PaymentMethod, value: string) => {
    setPayment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  const validateForm = () => {
    // Address validation
    if (!address.street || !address.city || !address.state || !address.zip_code || !address.phone) {
      alert('Please fill in all address fields including phone number');
      return false;
    }

    // Phone number validation (Bulgarian format: 10 digits)
    const phoneDigits = address.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      alert('Please enter a valid 10-digit phone number (e.g., 0812345678)');
      return false;
    }

    // Payment validation
    if (!payment.cardNumber || !payment.expiryDate || !payment.cvv || !payment.cardholderName) {
      alert('Please fill in all payment fields');
      return false;
    }

    // Basic card number validation (should be 16 digits)
    // Skip validation if using existing payment method (starts with stars)
    const cardDigits = payment.cardNumber.replace(/\D/g, '');
    const isExistingCard = payment.cardNumber.startsWith('****');
    
    if (!isExistingCard && cardDigits.length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return false;
    }

    // Basic expiry validation
    if (payment.expiryDate.length !== 5) {
      alert('Please enter a valid expiry date (MM/YY)');
      return false;
    }

    // CVV validation
    if (payment.cvv.length < 3 || payment.cvv.length > 4) {
      alert('Please enter a valid CVV');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please log in to place an order');
        return;
      }

      // Save address if requested
      if (saveAddress) {
        const addressData = {
          user_id: user.id,
          street: address.street,
          city: address.city,
          state: address.state,
          zip_code: address.zip_code,
          country: address.country,
          phone: address.phone
        };

        if (hasExistingAddress) {
          // Update existing address
          await supabase
            .from('addresses')
            .update(addressData)
            .eq('user_id', user.id);
        } else {
          // Insert new address
          await supabase
            .from('addresses')
            .insert(addressData);
        }
      }


      // TODO: Process payment with payment processor
      // For now, we'll simulate a successful payment
      
      // Prepare cart items for order creation
      console.log('Cart items before mapping:', items);
      
      const cartItems = items.map(item => {
        const mappedItem = {
          shirt_id: item.tshirt.id,
          title: item.tshirt.title || item.tshirt.label,
          description: item.tshirt.description || '',
          price: item.tshirt.price,
          color: item.tshirt.color || '',
          designs: null, // Will be fetched from the shirts table by the database function
          preview_front_url: item.tshirt.preview_front_url || '',
          preview_back_url: item.tshirt.preview_back_url || '',
          size: item.size,
          quantity: item.quantity
        };
        console.log('Mapped cart item:', mappedItem);
        return mappedItem;
      });
      
      console.log('Final cart items:', cartItems);
      
      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        throw new Error('No items in cart to process');
      }
      
      // Check for required fields
      const invalidItems = cartItems.filter(item => 
        !item.shirt_id || !item.title || !item.price || !item.size || !item.quantity
      );
      
      if (invalidItems.length > 0) {
        console.error('Invalid cart items found:', invalidItems);
        throw new Error('Some cart items are missing required information');
      }

      // Try with phone first, fallback without phone if function doesn't support it yet
      let orderData = {
        p_user_id: user.id,
        p_cart_items: cartItems,
        p_shipping_address: {
          street: address.street,
          city: address.city,
          state: address.state,
          zip_code: address.zip_code,
          country: address.country,
          phone: address.phone
        },
        p_payment_method_last4: payment.cardNumber.slice(-4)
      };
      
      console.log('Creating order with data:', orderData);

      // Create order using the database function
      let { data: orderId, error: orderError } = await supabase
        .rpc('create_order', orderData);

      console.log('First attempt result:', { orderId, orderError });

      // If error might be due to phone field not existing, try without phone
      if (orderError) {
        console.log('Error occurred, trying without phone field...');
        console.log('Error details:', JSON.stringify(orderError, null, 2));
        
        orderData = {
          p_user_id: user.id,
          p_cart_items: cartItems,
          p_shipping_address: {
            street: address.street,
            city: address.city,
            state: address.state,
            zip_code: address.zip_code,
            country: address.country,
            phone: address.phone || ''
          },
          p_payment_method_last4: payment.cardNumber.slice(-4)
        };
        
        console.log('Retrying with data:', orderData);
        
        const result = await supabase.rpc('create_order', orderData);
        orderId = result.data;
        orderError = result.error;
        
        console.log('Second attempt result:', { orderId, orderError });
      }

      if (orderError) {
        console.error('Final order creation error:', JSON.stringify(orderError, null, 2));
        console.error('Error type:', typeof orderError);
        console.error('Error keys:', Object.keys(orderError));
        throw orderError;
      }

      console.log('Order created successfully with ID:', orderId);

      // Clear cart after successful order
      clearCart();
      
      // Show success message and redirect to orders page
      alert('Order placed successfully! Thank you for your purchase.');
      
      // Redirect to orders page to show the new order
      router.push('/orders');
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div style={{ marginLeft: '256px' }}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div style={{ marginLeft: '256px' }}>
        <main className="min-h-screen overflow-auto">
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Checkout</h1>
                <p className="text-slate-600 mt-1">Complete your order</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Forms Section */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Shipping Address */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-slate-800">Shipping Address</h2>
                      {hasExistingAddress && (
                        <span className="text-sm text-green-600 font-medium">✓ Saved Address</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                          placeholder="ul. Vitosha 15"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                          placeholder="Sofia"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                          placeholder="Sofia City"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={address.zip_code}
                          onChange={(e) => handleAddressChange('zip_code', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                          placeholder="1000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Country
                        </label>
                        <select
                          value={address.country}
                          onChange={(e) => handleAddressChange('country', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 bg-white"
                        >
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
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Phone Number (10 digits)
                        </label>
                        <input
                          type="tel"
                          value={address.phone}
                          onChange={(e) => handleAddressChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                          placeholder="0812345678"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">
                          Save this address for future purchases
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Payment Method</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={payment.cardholderName}
                          onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={payment.cardNumber}
                          onChange={(e) => handlePaymentChange('cardNumber', formatCardNumber(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={payment.expiryDate}
                          onChange={(e) => handlePaymentChange('expiryDate', formatExpiryDate(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={payment.cvv}
                          onChange={(e) => handlePaymentChange('cvv', e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Order Summary</h2>
                    
                    {/* Items */}
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.tshirt.preview_front_url ? (
                              <img
                                src={item.tshirt.preview_front_url}
                                alt={item.tshirt.label || 'T-shirt'}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div 
                                className="w-8 h-10 rounded-sm border border-slate-300"
                                style={{ backgroundColor: item.tshirt.color || '#f8fafc' }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-800 truncate">
                              {item.tshirt.label || item.tshirt.title || 'T-shirt'}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Size {item.size} • Qty {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium text-slate-800">
                            ${(item.tshirt.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Totals */}
                    <div className="space-y-2 border-t border-slate-200 pt-4">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal ({totalItems} items)</span>
                        <span>${subtotalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Shipping</span>
                        <span>${shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold text-slate-800 border-t border-slate-200 pt-2">
                        <span>Total</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={processing}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 mt-6"
                    >
                      {processing ? 'Processing...' : `Place Order • $${totalPrice.toFixed(2)}`}
                    </button>

                    <button
                      onClick={() => router.push('/cart')}
                      className="w-full text-blue-600 hover:text-blue-700 py-2 px-4 font-medium transition-colors duration-200"
                    >
                      ← Back to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
