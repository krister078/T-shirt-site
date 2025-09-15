'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Sidebar } from '@/components/layout/Sidebar';

export default function CartPage() {
  const router = useRouter();
  const { items, getTotalItems, getTotalPrice, removeFromCart, updateQuantity, updateSize, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const totalItems = getTotalItems();
  const subtotalPrice = getTotalPrice();
  const shippingCost = 5.99;
  const totalPrice = subtotalPrice + shippingCost;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // Navigate to checkout page
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar currentPage="dashboard" />
      <div style={{ marginLeft: '256px' }}>
        <main className="min-h-screen overflow-auto">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800">Shopping Cart</h1>
                    <p className="text-slate-700 mt-1 font-medium">
                      {totalItems === 0 ? 'Your cart is empty' : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
                    </p>
                  </div>
                  <button
                    onClick={handleContinueShopping}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    ← Continue Shopping
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                /* Empty Cart State */
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0h9" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">Your cart is empty</h2>
                  <p className="text-slate-600 mb-6">Looks like you haven&apos;t added any T-shirts to your cart yet.</p>
                  <button
                    onClick={handleContinueShopping}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Cart Items */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-slate-800">Items in Cart</h2>
                          <button
                            onClick={clearCart}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-slate-200">
                        {items.map((item) => (
                          <div key={item.id} className="p-6">
                            <div className="flex items-start gap-4">
                              {/* T-shirt Preview */}
                              <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                {item.tshirt.preview_front_url ? (
                                  <img
                                    src={item.tshirt.preview_front_url}
                                    alt={item.tshirt.label || item.tshirt.title || 'T-shirt'}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div 
                                    className="w-12 h-16 rounded-sm border border-slate-300"
                                    style={{ backgroundColor: item.tshirt.color || '#f8fafc' }}
                                  />
                                )}
                              </div>

                              {/* Item Details */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 mb-1">
                                  {item.tshirt.label || item.tshirt.title || 'Untitled T-Shirt'}
                                </h3>
                                {item.tshirt.description && (
                                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                    {item.tshirt.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                                  <div className="flex items-center gap-1">
                                    <div 
                                      className="w-3 h-3 rounded-full border border-slate-300"
                                      style={{ backgroundColor: item.tshirt.color || '#f8fafc' }}
                                    />
                                    Color
                                  </div>
                                  {item.tshirt.profiles && (
                                    <span>
                                      by {(item.tshirt.profiles.first_name && item.tshirt.profiles.last_name) 
                                        ? `${item.tshirt.profiles.first_name} ${item.tshirt.profiles.last_name}`.trim()
                                        : item.tshirt.profiles.email?.split('@')[0] || 'Anonymous'}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Size Selector */}
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-600">Size:</span>
                                  <select
                                    value={item.size}
                                    onChange={(e) => updateSize(item.id, e.target.value)}
                                    className="text-sm border border-slate-300 rounded px-2 py-1 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="XS">XS</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                    <option value="XXXL">XXXL</option>
                                  </select>
                                </div>
                              </div>

                              {/* Price and Controls */}
                              <div className="text-right flex-shrink-0">
                                <div className="text-lg font-bold text-emerald-600 mb-2">
                                  ${(item.tshirt.price * item.quantity).toFixed(2)}
                                </div>
                                <div className="text-sm text-slate-500 mb-3">
                                  ${item.tshirt.price.toFixed(2)} each
                                </div>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 mb-3">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded border border-slate-300"
                                  >
                                    -
                                  </button>
                                  <span className="w-12 text-center font-medium text-slate-800">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded border border-slate-300"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Remove Button */}
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-8">
                      <h2 className="text-lg font-semibold text-slate-800 mb-4">Order Summary</h2>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal ({totalItems} items)</span>
                          <span>${subtotalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Shipping</span>
                          <span>${shippingCost.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3">
                          <div className="flex justify-between text-lg font-semibold text-slate-800">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 mb-3"
                      >
                        {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                      </button>

                      <button
                        onClick={handleContinueShopping}
                        className="w-full text-blue-600 hover:text-blue-700 py-2 px-4 font-medium transition-colors duration-200"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
