'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';
import { TShirtDesigner } from '@/components/tshirt/TShirtDesigner';
import { TShirtForm } from '@/components/tshirt/TShirtForm';
import { captureTShirtSnapshots } from '@/utils/tshirtSnapshot';
import { uploadDesignFiles, uploadBase64Image } from '@/utils/fileUpload';

export default function CreateTShirtPage() {
  const router = useRouter();
  const supabase = createClient();
  const [tshirtData, setTshirtData] = useState({
    label: '',
    description: '',
    price: 19.99,
    color: '#ffffff',
    designs: {
      front: [] as Array<{
        file: File;
        position: { x: number; y: number };
        size: { width: number; height: number };
        rotation: number;
        id: string;
      }>,
      back: [] as Array<{
        file: File;
        position: { x: number; y: number };
        size: { width: number; height: number };
        rotation: number;
        id: string;
      }>
    },
    currentView: 'front' as 'front' | 'back'
  });

  const handleFormChange = (field: string, value: string | number | typeof tshirtData.designs | 'front' | 'back') => {
    setTshirtData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDesignChange = (updates: { designs?: typeof tshirtData.designs; currentView?: 'front' | 'back' }) => {
    setTshirtData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleSave = async () => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        alert('You must be logged in to save a t-shirt');
        return;
      }

      // Validate required fields
      if (!tshirtData.label.trim()) {
        alert('Please enter a label for your t-shirt');
        return;
      }

      // Generate and upload T-shirt snapshots
      console.log('Generating T-shirt snapshots...');
      const snapshotUrls: { front: string | null; back: string | null } = { front: null, back: null };
      try {
        const snapshots = await captureTShirtSnapshots(tshirtData);
        console.log('Snapshots generated successfully');
        
        // Upload snapshots to Supabase Storage
        console.log('Uploading snapshots to storage...');
        const timestamp = Date.now();
        
        if (snapshots.front) {
          const frontUpload = await uploadBase64Image(
            snapshots.front,
            `front-${timestamp}.png`,
            'tshirt-previews'
          );
          if (frontUpload.success && frontUpload.url) {
            snapshotUrls.front = frontUpload.url;
          }
        }
        
        if (snapshots.back) {
          const backUpload = await uploadBase64Image(
            snapshots.back,
            `back-${timestamp}.png`,
            'tshirt-previews'
          );
          if (backUpload.success && backUpload.url) {
            snapshotUrls.back = backUpload.url;
          }
        }
        
        console.log('Snapshots uploaded successfully:', snapshotUrls);
      } catch (snapshotError) {
        console.error('Error generating/uploading snapshots:', snapshotError);
        // Continue without snapshots if generation fails
      }

      // Upload design files to Supabase Storage
      console.log('Uploading design files to Supabase Storage...');
      const processedDesigns = await uploadDesignFiles(tshirtData.designs);
      console.log('Design files uploaded successfully:', processedDesigns);
      

      // Prepare data for database insertion
      const insertData: {
        user_id: string;
        label: string;
        title: string;
        description: string;
        price: number;
        color: string;
        designs: typeof processedDesigns;
        status: string;
        preview_front_url?: string;
        preview_back_url?: string;
      } = {
        user_id: user.id,
        label: tshirtData.label,
        title: tshirtData.label, // Keep for backward compatibility
        description: tshirtData.description,
        price: tshirtData.price,
        color: tshirtData.color,
        designs: processedDesigns,
        status: 'draft'
      };

      // Only add preview URLs if snapshots were uploaded successfully
      if (snapshotUrls.front) {
        insertData.preview_front_url = snapshotUrls.front;
      }
      if (snapshotUrls.back) {
        insertData.preview_back_url = snapshotUrls.back;
      }

      console.log('Inserting T-shirt data:', { ...insertData, preview_front_url: snapshotUrls.front ? '[URL]' : null, preview_back_url: snapshotUrls.back ? '[URL]' : null });

      // Save to database
      const { data, error } = await supabase
        .from('shirts')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Failed to save t-shirt: ${error.message || 'Unknown error'}`);
        return;
      }

      console.log('T-shirt saved successfully:', data);
      alert('T-shirt saved successfully!');
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Unexpected error saving t-shirt:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      alert(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar currentPage="create-tshirt" />
      <div style={{ marginLeft: '256px' }}>
        <main className="min-h-screen overflow-auto">
          <div className="p-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Create T-Shirt</h1>
                  <p className="text-slate-600 mt-1">Design your custom t-shirt</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Save T-Shirt
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="space-y-6">
                  <TShirtForm 
                    data={tshirtData}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Designer Section */}
                <div className="space-y-6">
                  <TShirtDesigner
                    color={tshirtData.color}
                    designs={tshirtData.designs}
                    currentView={tshirtData.currentView}
                    onChange={handleDesignChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
