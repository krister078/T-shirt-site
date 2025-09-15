'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';
import { OrderWithItems } from '@/lib/supabase';
import { ShippingLabelGenerator } from '@/components/orders/ShippingLabelGenerator';

interface OrderCardProps {
  order: OrderWithItems;
}

function OrderCard({ order }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Order Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Order #{order.order_number}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <span className="text-lg font-bold text-slate-900">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-6">
        <h4 className="text-md font-medium text-slate-800 mb-4">
          Items ({order.order_items.length})
        </h4>
        <div className="space-y-4">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-start gap-4">
              {/* T-Shirt Preview */}
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                {item.shirt_preview_front_url ? (
                  <img
                    src={item.shirt_preview_front_url}
                    alt={item.shirt_title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full rounded-lg"
                    style={{ backgroundColor: item.shirt_color || '#ffffff' }}
                  />
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-slate-900 truncate">
                  {item.shirt_title}
                </h5>
                {item.shirt_description && (
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {item.shirt_description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <span>Size: {item.size}</span>
                  <span>Qty: {item.quantity}</span>
                  <span className="font-medium text-slate-900">
                    ${item.item_total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal:</span>
              <span className="text-slate-900">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Shipping:</span>
              <span className="text-slate-900">${order.shipping_cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-2 border-t border-slate-200">
              <span className="text-slate-900">Total:</span>
              <span className="text-slate-900">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <h5 className="font-medium text-slate-800 mb-2">Shipping Address</h5>
          <div className="text-sm text-slate-600">
            <p>{order.shipping_street}</p>
            <p>
              {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
            </p>
            <p>{order.shipping_country}</p>
          </div>
        </div>

        {/* Tracking Info */}
        {(order.status === 'shipped' || order.status === 'delivered') && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <h5 className="font-medium text-slate-800 mb-2">Tracking</h5>
            <div className="text-sm text-slate-600">
              {order.shipped_at && (
                <p>Shipped on {formatDate(order.shipped_at)}</p>
              )}
              {order.delivered_at && (
                <p>Delivered on {formatDate(order.delivered_at)}</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <h5 className="font-medium text-slate-800">Actions</h5>
            <ShippingLabelGenerator order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/auth/login');
          return;
        }

        // Fetch orders with their items
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersError) {
          throw ordersError;
        }

        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar currentPage="orders" />
        <div className="ml-64 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar currentPage="orders" />
        <div className="ml-64 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="text-red-500 text-xl mb-4">⚠️</div>
              <p className="text-slate-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar currentPage="orders" />
      <div className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
            <p className="text-slate-600 mt-2">
              Track and manage your T-shirt orders
            </p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No orders yet</h3>
              <p className="text-slate-600 mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Browse T-Shirts
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
