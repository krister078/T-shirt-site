'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

export function CartIcon() {
  const { items, getTotalItems, getTotalPrice, removeFromCart, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleViewCart = () => {
    setIsOpen(false);
    router.push('/cart');
  };

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0h9" />
        </svg>
        
        {/* Item Count Badge */}
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Shopping Cart</h3>
              <span className="text-sm text-slate-800 font-medium">{totalItems} items</span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-center">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0h9" />
                </svg>
                <p className="text-slate-500 text-sm">Your cart is empty</p>
              </div>
            ) : (
              <div className="p-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                    {/* T-shirt Preview */}
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.tshirt.preview_front_url ? (
                        <img
                          src={item.tshirt.preview_front_url}
                          alt={item.tshirt.label || item.tshirt.title || 'T-shirt'}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div 
                          className="w-8 h-10 rounded-sm border border-slate-300"
                          style={{ backgroundColor: item.tshirt.color || '#f8fafc' }}
                        />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-800 truncate">
                        {item.tshirt.label || item.tshirt.title || 'Untitled T-Shirt'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        ${item.tshirt.price.toFixed(2)} each • Size {item.size}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-slate-800">Total:</span>
                <span className="font-bold text-lg text-emerald-600">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Checkout
                </button>
                <button
                  onClick={handleViewCart}
                  className="w-full text-blue-600 hover:text-blue-700 py-2 px-4 font-medium transition-colors duration-200"
                >
                  View Cart
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
