'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { OrderWithItems } from '@/lib/supabase';

export function MyOrdersSection() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('Authentication required');
          return;
        }

        // Fetch only the 3 most recent orders for the profile section
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (ordersError) {
          throw ordersError;
        }

        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, [supabase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Recent Orders</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-slate-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Recent Orders</h2>
        <div className="text-center py-8">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Recent Orders</h2>
        {orders.length > 0 && (
          <button
            onClick={() => router.push('/orders')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            View All Orders
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No orders yet</h3>
          <p className="text-slate-600 mb-4">
            Start shopping to see your orders here!
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Browse T-Shirts
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-slate-900">
                    Order #{order.order_number}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {formatDate(order.created_at)} • {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="font-semibold text-slate-900">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Show first few items */}
              <div className="space-y-2">
                {order.order_items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                      {item.shirt_preview_front_url ? (
                        <img
                          src={item.shirt_preview_front_url}
                          alt={item.shirt_title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full"
                          style={{ backgroundColor: item.shirt_color || '#ffffff' }}
                        />
                      )}
                    </div>
                    <span className="text-slate-700 flex-1 truncate">
                      {item.shirt_title} (Size: {item.size})
                    </span>
                    <span className="text-slate-600">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
                {order.order_items.length > 2 && (
                  <p className="text-sm text-slate-500 ml-11">
                    +{order.order_items.length - 2} more item{order.order_items.length - 2 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
