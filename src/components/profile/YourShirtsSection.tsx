'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deleteTShirtWithFiles } from '@/utils/fileUpload';

interface TShirt {
  id: string;
  label: string;
  description: string;
  price: number;
  color: string;
  preview_front_url?: string;
  preview_back_url?: string;
  designs: any;
  created_at: string;
}

export function YourShirtsSection() {
  const router = useRouter();
  const supabase = createClient();
  const [tshirts, setTshirts] = useState<TShirt[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    tshirtId: string;
    tshirtLabel: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    tshirtId: '',
    tshirtLabel: '',
    isDeleting: false
  });

  // Fetch user's T-shirts
  useEffect(() => {
    fetchTShirts();
  }, []);

  const fetchTShirts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shirts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching T-shirts:', error);
        return;
      }

      setTshirts(data || []);
    } catch (error) {
      console.error('Error fetching T-shirts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tshirt: TShirt) => {
    setDeleteDialog({
      isOpen: true,
      tshirtId: tshirt.id,
      tshirtLabel: tshirt.label,
      isDeleting: false
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      const result = await deleteTShirtWithFiles(deleteDialog.tshirtId);
      
      if (result.success) {
        // Remove from local state
        setTshirts(prev => prev.filter(t => t.id !== deleteDialog.tshirtId));
        setDeleteDialog({ isOpen: false, tshirtId: '', tshirtLabel: '', isDeleting: false });
      } else {
        alert(`Failed to delete T-shirt: ${result.error}`);
        setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
      }
    } catch (error) {
      console.error('Error deleting T-shirt:', error);
      alert('An unexpected error occurred while deleting the T-shirt');
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteDialog.isDeleting) {
      setDeleteDialog({ isOpen: false, tshirtId: '', tshirtLabel: '', isDeleting: false });
    }
  };

  const navigateToCreate = () => {
    router.push('/create-tshirt');
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Your Shirts</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Your Shirts</h2>
          <button
            type="button"
            onClick={navigateToCreate}
            className="w-[120px] h-[36px] flex items-center justify-center rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-sm flex-shrink-0"
            style={{ 
              minWidth: '120px', 
              maxWidth: '120px', 
              minHeight: '36px', 
              maxHeight: '36px',
              transform: 'none',
              boxShadow: 'none'
            }}
          >
            Add New Shirt
          </button>
        </div>

        {tshirts.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              You don't have any shirts yet
            </h3>
            
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Start creating your custom t-shirt designs. Your shirts will appear here once you create them.
            </p>

            <Button onClick={navigateToCreate}>
              Create Your First Shirt
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tshirts.map((tshirt) => (
              <TShirtCard
                key={tshirt.id}
                tshirt={tshirt}
                onDelete={() => handleDeleteClick(tshirt)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete T-Shirt"
        message={`Are you sure you want to delete "${deleteDialog.tshirtLabel}"? This action cannot be undone and will permanently delete the T-shirt and all its associated files.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleteDialog.isDeleting}
      />
    </>
  );
}

interface TShirtCardProps {
  tshirt: TShirt;
  onDelete: () => void;
}

function TShirtCard({ tshirt, onDelete }: TShirtCardProps) {
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front');
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<{front: boolean; back: boolean}>({
    front: false,
    back: false
  });

  const hasBackDesigns = (tshirt.designs?.back && tshirt.designs.back.length > 0) || tshirt.preview_back_url;

  const handleImageError = (view: 'front' | 'back') => {
    setImageLoadErrors(prev => ({
      ...prev,
      [view]: true
    }));
  };

  const toggleView = () => {
    if (hasBackDesigns) {
      setCurrentView(currentView === 'front' ? 'back' : 'front');
    }
  };

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete Button - Shows on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`absolute top-2 left-2 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
        title="Delete T-shirt"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Flip Button - Shows if has back designs */}
      {hasBackDesigns && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleView();
          }}
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-400"
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
      )}

      {/* View Indicator */}
      {hasBackDesigns && (
        <div className="absolute top-12 right-2 z-10 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
          {currentView === 'front' ? 'Front' : 'Back'}
        </div>
      )}

      {/* Title */}
      <div className="p-4 pb-2">
        <h3 className="font-semibold text-gray-900 text-center truncate">
          {tshirt.label}
        </h3>
      </div>

      {/* T-shirt Preview */}
      <div className="aspect-square p-4 flex items-center justify-center bg-gray-50">
        {(currentView === 'front' ? tshirt.preview_front_url : tshirt.preview_back_url) && 
         !imageLoadErrors[currentView] ? (
          <img
            src={currentView === 'front' ? tshirt.preview_front_url : tshirt.preview_back_url}
            alt={`${tshirt.label} ${currentView}`}
            className="w-full h-full object-contain"
            style={{ backgroundColor: 'transparent', imageRendering: 'crisp-edges' }}
            onError={() => handleImageError(currentView)}
            onLoad={() => {
              // Reset error state if image loads successfully
              setImageLoadErrors(prev => ({
                ...prev,
                [currentView]: false
              }));
            }}
          />
        ) : (
          // Fallback SVG T-shirt
          <svg
            viewBox="0 0 300 400"
            className="w-full h-full max-w-[200px] max-h-[200px]"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
          >
            <defs>
              <linearGradient id={`tshirt-gradient-${tshirt.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={tshirt.color || '#ffffff'} />
                <stop offset="100%" stopColor={tshirt.color || '#f0f0f0'} />
              </linearGradient>
            </defs>
            
            {/* T-shirt body */}
            <path
              d="M60 90 L60 370 Q60 380 70 380 L230 380 Q240 380 240 370 L240 90 L220 90 L220 60 Q220 45 205 45 L95 45 Q80 45 80 60 L80 90 Z"
              fill={`url(#tshirt-gradient-${tshirt.id})`}
              stroke="#d1d5db"
              strokeWidth="1"
            />
            
            {/* Left sleeve */}
            <path
              d="M60 90 L0 100 L10 170 L60 165 Z"
              fill={`url(#tshirt-gradient-${tshirt.id})`}
              stroke="#d1d5db"
              strokeWidth="1"
            />
            
            {/* Right sleeve */}
            <path
              d="M240 90 L300 100 L290 170 L240 165 Z"
              fill={`url(#tshirt-gradient-${tshirt.id})`}
              stroke="#d1d5db"
              strokeWidth="1"
            />
            
            {/* Neckline */}
            <path
              d="M95 45 Q150 80 205 45"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="1"
            />
          </svg>
        )}
      </div>

      {/* Description and Price */}
      <div className="p-4 pt-2 flex justify-between items-end">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 line-clamp-2">
            {tshirt.description || 'No description'}
          </p>
        </div>
        <div className="ml-3 text-right">
          <p className="text-lg font-bold text-gray-900">
            ${tshirt.price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
