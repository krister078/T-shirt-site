/**
 * File upload utilities for Supabase Storage
 */

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFileToStorage(
  file: File,
  bucket: string = 'tshirt-designs',
  folder: string = 'designs'
): Promise<UploadResult> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Generate unique filename with user ID for security
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    console.log(`Uploading file: ${fileName}`);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log(`File uploaded successfully: ${urlData.publicUrl}`);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Unexpected upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Upload multiple design files and return their URLs
 */
export async function uploadDesignFiles(
  designs: {
    front: Array<{
      file: File;
      position: { x: number; y: number };
      size: { width: number; height: number };
      id: string;
    }>;
    back: Array<{
      file: File;
      position: { x: number; y: number };
      size: { width: number; height: number };
      id: string;
    }>;
  }
): Promise<{
  front: Array<{
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  }>;
  back: Array<{
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  }>;
}> {
  const processedDesigns = { front: [], back: [] };

  for (const view of ['front', 'back'] as const) {
    for (const design of designs[view]) {
      try {
        console.log(`Uploading ${view} design: ${design.file.name}`);
        
        const uploadResult = await uploadFileToStorage(
          design.file,
          'tshirt-designs',
          `designs/${view}`
        );

        if (uploadResult.success && uploadResult.url) {
          processedDesigns[view].push({
            id: design.id,
            position: design.position,
            size: design.size,
            fileName: design.file.name,
            fileType: design.file.type,
            fileSize: design.file.size,
            fileUrl: uploadResult.url
          });
        } else {
          console.error(`Failed to upload ${design.file.name}:`, uploadResult.error);
          // Continue with other files even if one fails
        }
      } catch (error) {
        console.error(`Error uploading ${design.file.name}:`, error);
        // Continue with other files
      }
    }
  }

  return processedDesigns;
}

/**
 * Upload a base64 image (like snapshots) to Supabase Storage
 */
export async function uploadBase64Image(
  base64Data: string,
  fileName: string,
  bucket: string = 'tshirt-previews'
): Promise<UploadResult> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Convert base64 to blob
    const response = await fetch(base64Data);
    const blob = await response.blob();
    
    // Create file from blob
    const file = new File([blob], fileName, { type: 'image/png' });
    
    // Upload using existing function with user-specific path
    return await uploadFileToStorage(file, bucket, 'previews');
    
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFileFromStorage(
  filePath: string,
  bucket: string = 'tshirt-designs'
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected delete error:', error);
    return false;
  }
}

/**
 * Delete a T-shirt and all its associated files
 */
export async function deleteTShirtWithFiles(tshirtId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // First, get the T-shirt data to find associated files
    const { data: tshirt, error: fetchError } = await supabase
      .from('shirts')
      .select('*')
      .eq('id', tshirtId)
      .eq('user_id', user.id) // Ensure user can only delete their own shirts
      .single();

    if (fetchError) {
      console.error('Error fetching T-shirt:', fetchError);
      return { success: false, error: 'T-shirt not found' };
    }

    // Delete associated files from storage
    const filesToDelete: Array<{ bucket: string; path: string }> = [];

    // Add preview images to deletion list
    if (tshirt.preview_front_url) {
      const frontPath = tshirt.preview_front_url.split('/').slice(-3).join('/'); // Extract user_id/previews/filename
      filesToDelete.push({ bucket: 'tshirt-previews', path: frontPath });
    }
    if (tshirt.preview_back_url) {
      const backPath = tshirt.preview_back_url.split('/').slice(-3).join('/'); // Extract user_id/previews/filename
      filesToDelete.push({ bucket: 'tshirt-previews', path: backPath });
    }

    // Add design files to deletion list
    if (tshirt.designs) {
      const designs = tshirt.designs as any;
      
      // Process front designs
      if (designs.front && Array.isArray(designs.front)) {
        for (const design of designs.front) {
          if (design.fileUrl) {
            const designPath = design.fileUrl.split('/').slice(-4).join('/'); // Extract user_id/designs/front/filename
            filesToDelete.push({ bucket: 'tshirt-designs', path: designPath });
          }
        }
      }
      
      // Process back designs
      if (designs.back && Array.isArray(designs.back)) {
        for (const design of designs.back) {
          if (design.fileUrl) {
            const designPath = design.fileUrl.split('/').slice(-4).join('/'); // Extract user_id/designs/back/filename
            filesToDelete.push({ bucket: 'tshirt-designs', path: designPath });
          }
        }
      }
    }

    // Delete files from storage
    console.log('Deleting files:', filesToDelete);
    for (const file of filesToDelete) {
      try {
        await deleteFileFromStorage(file.path, file.bucket);
      } catch (fileError) {
        console.warn(`Failed to delete file ${file.path}:`, fileError);
        // Continue with deletion even if some files fail
      }
    }

    // Delete the T-shirt record from database
    const { error: deleteError } = await supabase
      .from('shirts')
      .delete()
      .eq('id', tshirtId)
      .eq('user_id', user.id); // Ensure user can only delete their own shirts

    if (deleteError) {
      console.error('Error deleting T-shirt from database:', deleteError);
      return { success: false, error: 'Failed to delete T-shirt' };
    }

    console.log('T-shirt deleted successfully:', tshirtId);
    return { success: true };

  } catch (error) {
    console.error('Unexpected error deleting T-shirt:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
