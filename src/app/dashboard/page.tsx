'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { CartIcon } from '@/components/cart/CartIcon';
import { useUserProfile } from '@/hooks/useUserProfile';

interface TShirtCardProps {
  tshirt: {
    id: string;
    label?: string;
    title?: string;
    description?: string;
    price: number;
    color?: string;
    preview_front_url?: string;
    preview_back_url?: string;
    designs?: { front: Array<{ id: string; fileUrl?: string }>; back: Array<{ id: string; fileUrl?: string }> };
    profiles?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
    created_at?: string;
  };
}

function TShirtCard({ tshirt }: TShirtCardProps) {
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front');
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, isInCart } = useCart();
  const { profile } = useUserProfile();


  const toggleView = () => {
    setCurrentView(currentView === 'front' ? 'back' : 'front');
  };

  // Truncate description to 180 characters (more space with taller cards)
  const truncatedDescription = (tshirt.description || 'No description provided').length > 180 
    ? (tshirt.description || 'No description provided').substring(0, 180) + '...'
    : (tshirt.description || 'No description provided');

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 cursor-pointer group flex flex-col min-h-96"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title Section */}
      <div className="p-4 pb-2 border-b border-gray-50">
        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors duration-200 text-center truncate">
          {tshirt.label || tshirt.title || 'Untitled T-Shirt'}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            by {(tshirt.profiles?.first_name && tshirt.profiles?.last_name) 
              ? `${tshirt.profiles.first_name} ${tshirt.profiles.last_name}`.trim()
              : tshirt.profiles?.email?.split('@')[0] || 'Anonymous'}
          </p>
          <span className="text-lg font-bold text-emerald-600">
            ${Number(tshirt.price || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Preview Section - Takes up most of the space */}
      <div className="flex-1 relative p-2">
        <div className="w-full h-full flex items-center justify-center relative">
          {/* T-Shirt Preview */}
          <div className="relative" style={{ width: '200px', height: '220px' }}>
            {/* Check if we have preview images */}
            {(currentView === 'front' && tshirt.preview_front_url) || (currentView === 'back' && tshirt.preview_back_url) ? (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={currentView === 'front' ? tshirt.preview_front_url : tshirt.preview_back_url}
                  alt={`${tshirt.label || 'T-Shirt'} ${currentView} view`}
                  className="max-w-full max-h-full object-contain drop-shadow-sm"
                  style={{ 
                    imageRendering: 'crisp-edges',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
            ) : (
              /* Fallback SVG for T-shirts without preview images */
              <svg
                width="200"
                height="220"
                viewBox="0 0 200 220"
                className="w-full h-full drop-shadow-sm"
              >
                <defs>
                  {/* Realistic gradient for fabric depth */}
                  <linearGradient id={`tshirt-gradient-${tshirt.id || 'default'}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={tshirt.color || '#ffffff'} />
                    <stop offset="100%" stopColor={tshirt.color || '#f0f0f0'} stopOpacity="0.9" />
                  </linearGradient>
                  {/* Subtle shadow */}
                  <filter id={`shadow-${tshirt.id || 'default'}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.08"/>
                  </filter>
                </defs>
                
                <g filter={`url(#shadow-${tshirt.id || 'default'})`}>
                  {/* Main T-Shirt Body - Realistic proportions like the photo */}
                  <path
                    d="M50 60 
                       L50 190 
                       Q50 195 55 195 
                       L145 195 
                       Q150 195 150 190 
                       L150 60 
                       L135 60 
                       L135 40 
                       Q135 30 125 30 
                       L75 30 
                       Q65 30 65 40 
                       L65 60 
                       Z"
                    fill={`url(#tshirt-gradient-${tshirt.id || 'default'})`}
                    stroke="#d1d5db"
                    strokeWidth="0.8"
                  />
                  
                  {/* Left Sleeve - Extra wide and longer realistic shape */}
                  <path
                    d="M50 60 
                       L5 70 
                       L13 120 
                       L50 115 
                       Z"
                    fill={`url(#tshirt-gradient-${tshirt.id || 'default'})`}
                    stroke="#d1d5db"
                    strokeWidth="0.8"
                  />
                  
                  {/* Right Sleeve - Extra wide and longer realistic shape */}
                  <path
                    d="M150 60 
                       L195 70 
                       L187 120 
                       L150 115 
                       Z"
                    fill={`url(#tshirt-gradient-${tshirt.id || 'default'})`}
                    stroke="#d1d5db"
                    strokeWidth="0.8"
                  />
                  
                  {/* Lower Crew Neckline - Deeper crew neck */}
                  <path
                    d="M75 30 Q100 55 125 30"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="0.8"
                  />
                  
                  {/* Subtle seam lines for realism */}
                  <line x1="50" y1="60" x2="50" y2="190" stroke="#e5e7eb" strokeWidth="0.3" opacity="0.6"/>
                  <line x1="150" y1="60" x2="150" y2="190" stroke="#e5e7eb" strokeWidth="0.3" opacity="0.6"/>
                </g>
              </svg>
            )}
          </div>

          {/* View Toggle Button - Always visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleView();
            }}
            className={`absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-400 ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-90 scale-95'
            }`}
            title={`View ${currentView === 'front' ? 'back' : 'front'}`}
          >
            {currentView === 'front' ? (
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              </svg>
            )}
          </button>

          {/* View Indicator - Always visible */}
          <div className="absolute bottom-2 left-2">
            <div className="flex space-x-1">
              <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                currentView === 'front' ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
              <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                currentView === 'back' ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
            </div>
          </div>

          {/* Add to Cart Button - Shows on hover */}
          <div className={`absolute bottom-2 right-2 transition-all duration-200 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const defaultSize = profile?.size || 'M';
                addToCart(tshirt, defaultSize);
              }}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg ${
                isInCart(tshirt.id)
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isInCart(tshirt.id) ? (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0h9" />
                  </svg>
                  Add to Cart
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Description and Price */}
      <div className="p-4 pt-3 border-t border-gray-50 mt-auto">
        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed font-medium min-h-[3rem]">
            {truncatedDescription}
          </p>
        </div>
        
        {/* Color Info */}
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" 
            style={{ backgroundColor: tshirt.color || '#f8fafc' }}
          />
          <span className="text-xs text-gray-500">Color</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [tshirts, setTshirts] = useState<TShirtCardProps['tshirt'][]>([]);
  const [filteredTshirts, setFilteredTshirts] = useState<TShirtCardProps['tshirt'][]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_low' | 'price_high'>('newest');

  const fetchTshirts = useCallback(async () => {
    try {
      // First, fetch all T-shirts without profile joins to avoid RLS issues
      const { data: shirtsData, error: shirtsError } = await supabase
        .from('shirts')
        .select('*')
        .order('created_at', { ascending: false });

      if (shirtsError) {
        console.error('Error fetching t-shirts:', shirtsError);
        return;
      }

      // Then, for each shirt, try to fetch the profile info
      // This approach handles RLS restrictions more gracefully
      const shirtsWithProfiles = await Promise.all(
        (shirtsData || []).map(async (shirt) => {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('email, first_name, last_name')
              .eq('id', shirt.user_id)
              .single();
            
            return {
              ...shirt,
              profiles: profileData
            };
          } catch {
            // If we can't fetch the profile (due to RLS), just return the shirt without profile
            return {
              ...shirt,
              profiles: undefined
            };
          }
        })
      );

      setTshirts(shirtsWithProfiles);
    } catch (error) {
      console.error('Error fetching t-shirts:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTshirts();
  }, [fetchTshirts]);

  // Filter and sort T-shirts
  useEffect(() => {
    let filtered = [...tshirts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tshirt => 
        (tshirt.label || tshirt.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tshirt.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((tshirt.profiles?.first_name && tshirt.profiles?.last_name) 
          ? `${tshirt.profiles.first_name} ${tshirt.profiles.last_name}`.trim()
          : tshirt.profiles?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
        break;
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }

    setFilteredTshirts(filtered);
  }, [tshirts, searchTerm, sortBy]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">T4U</h1>
            <p className="text-slate-600 mt-1">Tees for You - Discover amazing designs from our community</p>
          </div>
          <div className="flex items-center gap-3">
            <CartIcon />
            <button 
              onClick={() => router.push('/create-tshirt')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add T-Shirt
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search T-shirts, creators, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
            
            {/* Sort */}
            <div className="sm:w-48 relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'price_low' | 'price_high')}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredTshirts.length} of {tshirts.length} T-shirts
            {searchTerm && (
              <span className="ml-2">
                for &quot;<span className="font-medium">{searchTerm}</span>&quot;
              </span>
            )}
          </div>
        </div>


        {/* T-Shirts Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Featured Designs</h2>
            <p className="text-slate-600 text-sm mt-1">Discover amazing T-shirt designs from our creative community</p>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading T4U...</p>
            </div>
          ) : filteredTshirts.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                {searchTerm ? 'No Results Found' : 'No T-Shirts Available'}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `No T-shirts match your search for &quot;${searchTerm}&quot;. Try different keywords or browse all designs.`
                  : 'Be the first to add a T-shirt design to T4U!'
                }
              </p>
              <button 
                onClick={() => router.push('/create-tshirt')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First T-Shirt
              </button>
            </div>
          ) : (
            /* T-Shirts Grid */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTshirts.map((tshirt) => (
                  <TShirtCard key={tshirt.id} tshirt={tshirt} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
