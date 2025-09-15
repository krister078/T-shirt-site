/**
 * Utility functions for capturing T-shirt design snapshots
 */

export interface TShirtDesignData {
  color: string;
  designs: {
    front: Array<{
      file: File;
      position: { x: number; y: number };
      size: { width: number; height: number };
      rotation: number;
      id: string;
    }>;
    back: Array<{
      file: File;
      position: { x: number; y: number };
      size: { width: number; height: number };
      rotation: number;
      id: string;
    }>;
  };
  currentView: 'front' | 'back';
}

/**
 * Creates a canvas element with the T-shirt design rendered on it
 */
export async function createTShirtCanvas(
  designData: TShirtDesignData,
  view: 'front' | 'back' = 'front'
): Promise<HTMLCanvasElement> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas size - matching the designer dimensions
    canvas.width = 300;
    canvas.height = 400;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up canvas for proper transparency handling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.globalCompositeOperation = 'source-over';

    console.log(`Drawing T-shirt shape for ${view} view...`);
    // Draw T-shirt shape
    await drawTShirtShape(ctx, designData.color || '#ffffff', view);

    // Create clipping mask for T-shirt shape to constrain designs
    console.log('Creating T-shirt clipping mask...');
    ctx.save();
    createTShirtClippingMask(ctx, view);
    ctx.clip();

    // Draw designs on the T-shirt (now clipped to T-shirt boundaries)
    const currentDesigns = designData.designs?.[view] || [];
    console.log(`Drawing ${currentDesigns.length} designs for ${view} view...`);
    
    for (const design of currentDesigns) {
      try {
        await drawDesignOnCanvas(ctx, design);
      } catch (designError) {
        console.error(`Error drawing design ${design.id}:`, designError);
        // Continue with other designs even if one fails
      }
    }

    // Restore context to remove clipping
    ctx.restore();

    return canvas;
  } catch (error) {
    console.error('Error creating T-shirt canvas:', error);
    throw error;
  }
}

/**
 * Draws the T-shirt shape on the canvas
 */
async function drawTShirtShape(
  ctx: CanvasRenderingContext2D,
  color: string,
  view: 'front' | 'back'
): Promise<void> {
  // Save the current context state
  ctx.save();
  
  // Create gradient for more realistic fabric look
  const gradient = ctx.createLinearGradient(0, 0, 300, 400);
  gradient.addColorStop(0, color || '#ffffff');
  gradient.addColorStop(1, adjustColorBrightness(color || '#ffffff', -0.1));
  
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  
  // Enable better rendering for transparency
  ctx.globalCompositeOperation = 'source-over';

  // Main T-shirt body - more realistic proportions
  ctx.beginPath();
  ctx.moveTo(60, 90);  // Start from shoulder
  ctx.lineTo(60, 370); // Down left side
  ctx.quadraticCurveTo(60, 380, 70, 380); // Rounded bottom left
  ctx.lineTo(230, 380); // Bottom edge
  ctx.quadraticCurveTo(240, 380, 240, 370); // Rounded bottom right
  ctx.lineTo(240, 90); // Up right side
  ctx.lineTo(220, 90); // Shoulder seam
  ctx.lineTo(220, 60); // Up to shoulder
  ctx.quadraticCurveTo(220, 45, 205, 45); // Rounded shoulder
  ctx.lineTo(95, 45); // Across shoulder
  ctx.quadraticCurveTo(80, 45, 80, 60); // Rounded shoulder
  ctx.lineTo(80, 90); // Down to armpit
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left sleeve - extra wide and longer realistic shape
  ctx.beginPath();
  ctx.moveTo(60, 90);
  ctx.lineTo(0, 100);
  ctx.lineTo(10, 170);
  ctx.lineTo(60, 165);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right sleeve - extra wide and longer realistic shape
  ctx.beginPath();
  ctx.moveTo(240, 90);
  ctx.lineTo(300, 100);
  ctx.lineTo(290, 170);
  ctx.lineTo(240, 165);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Neckline - lower crew neck
  ctx.beginPath();
  if (view === 'front') {
    // Lower crew neck - deeper curve
    ctx.moveTo(95, 45);
    ctx.quadraticCurveTo(150, 80, 205, 45);
  } else {
    // Back neckline - slightly lower
    ctx.moveTo(95, 45);
    ctx.quadraticCurveTo(150, 55, 205, 45);
  }
  ctx.stroke();

  // Add subtle seam lines for realism
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.6;
  
  // Side seams
  ctx.beginPath();
  ctx.moveTo(60, 90);
  ctx.lineTo(60, 370);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(240, 90);
  ctx.lineTo(240, 370);
  ctx.stroke();
  
  ctx.globalAlpha = 1;
  
  // Restore the context state
  ctx.restore();
}

/**
 * Creates a clipping mask that matches the T-shirt shape
 * This ensures designs only appear within the T-shirt boundaries
 */
function createTShirtClippingMask(
  ctx: CanvasRenderingContext2D,
  _view: 'front' | 'back'
): void {
  ctx.beginPath();
  
  // Main T-shirt body clipping path (same coordinates as drawTShirtShape)
  ctx.moveTo(60, 90);  // Start from shoulder
  ctx.lineTo(60, 370); // Down left side
  ctx.quadraticCurveTo(60, 380, 70, 380); // Rounded bottom left
  ctx.lineTo(230, 380); // Bottom edge
  ctx.quadraticCurveTo(240, 380, 240, 370); // Rounded bottom right
  ctx.lineTo(240, 90); // Up right side
  ctx.lineTo(220, 90); // Shoulder seam
  ctx.lineTo(220, 60); // Up to shoulder
  ctx.quadraticCurveTo(220, 45, 205, 45); // Rounded shoulder
  ctx.lineTo(95, 45); // Across shoulder
  ctx.quadraticCurveTo(80, 45, 80, 60); // Rounded shoulder
  ctx.lineTo(80, 90); // Down to armpit
  ctx.closePath();

  // Add left sleeve to clipping path
  ctx.moveTo(60, 90);
  ctx.lineTo(0, 100);
  ctx.lineTo(10, 170);
  ctx.lineTo(60, 165);
  ctx.closePath();

  // Add right sleeve to clipping path
  ctx.moveTo(240, 90);
  ctx.lineTo(300, 100);
  ctx.lineTo(290, 170);
  ctx.lineTo(240, 165);
  ctx.closePath();
}

/**
 * Helper function to adjust color brightness
 */
function adjustColorBrightness(color: string, amount: number): string {
  try {
    // Simple color adjustment - in production you might want a more sophisticated function
    if (color && color.startsWith('#') && color.length >= 4) {
      let hex = color.slice(1);
      
      // Handle short hex colors (#fff -> #ffffff)
      if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
      }
      
      if (hex.length === 6) {
        const num = parseInt(hex, 16);
        if (!isNaN(num)) {
          const r = Math.max(0, Math.min(255, (num >> 16) + Math.round(255 * amount)));
          const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * amount)));
          const b = Math.max(0, Math.min(255, (num & 0x0000FF) + Math.round(255 * amount)));
          return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        }
      }
    }
    return color || '#ffffff';
  } catch (error) {
    console.error('Error adjusting color brightness:', error);
    return color || '#ffffff';
  }
}

/**
 * Draws a design element on the canvas
 */
async function drawDesignOnCanvas(
  ctx: CanvasRenderingContext2D,
  design: {
    file: File;
    position: { x: number; y: number };
    size: { width: number; height: number };
    rotation: number;
    id: string;
  }
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        // Save context state for transparency handling
        ctx.save();
        
        // Set up proper compositing for transparency
        ctx.globalCompositeOperation = 'source-over';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Scale positions and sizes to match canvas dimensions
        // The designer uses 500x600 container, canvas is 300x400
        const scaleX = 300 / 500;
        const scaleY = 400 / 600;
        
        const scaledX = design.position.x * scaleX;
        const scaledY = design.position.y * scaleY;
        const scaledWidth = design.size.width * scaleX;
        const scaledHeight = design.size.height * scaleY;
        
        // Apply rotation if specified
        if (design.rotation && design.rotation !== 0) {
          // Calculate center point for rotation
          const centerX = scaledX + scaledWidth / 2;
          const centerY = scaledY + scaledHeight / 2;
          
          // Translate to center, rotate, then translate back
          ctx.translate(centerX, centerY);
          ctx.rotate((design.rotation * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);
        }
        
        // Draw the image with proper transparency handling
        ctx.drawImage(img, scaledX, scaledY, scaledWidth, scaledHeight);
        
        // Restore context state (this also restores rotation)
        ctx.restore();
        resolve();
      } catch (drawError) {
        console.error('Error drawing design on canvas:', drawError);
        ctx.restore(); // Make sure to restore even on error
        resolve(); // Continue with other designs
      }
    };
    
    img.onerror = () => {
      console.error('Failed to load design image:', design.file.name);
      resolve(); // Continue even if one image fails
    };
    
    // Convert file to data URL with proper handling
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if (result) {
          img.src = result;
        } else {
          console.error('No result from FileReader for:', design.file.name);
          resolve();
        }
      } catch (error) {
        console.error('Error setting image source:', error);
        resolve();
      }
    };
    reader.onerror = () => {
      console.error('Failed to read design file:', design.file.name);
      resolve();
    };
    
    try {
      reader.readAsDataURL(design.file);
    } catch (error) {
      console.error('Error reading file as data URL:', error);
      resolve();
    }
  });
}

/**
 * Captures both front and back views of the T-shirt design
 */
export async function captureTShirtSnapshots(
  designData: TShirtDesignData
): Promise<{ front: string; back: string }> {
  try {
    console.log('Creating front canvas...');
    const frontCanvas = await createTShirtCanvas(designData, 'front');
    console.log('Creating back canvas...');
    const backCanvas = await createTShirtCanvas(designData, 'back');
    
    console.log('Converting canvases to data URLs...');
    const result = {
      front: frontCanvas.toDataURL('image/png', 0.9),
      back: backCanvas.toDataURL('image/png', 0.9)
    };
    
    console.log('Snapshots created successfully');
    return result;
  } catch (error) {
    console.error('Error in captureTShirtSnapshots:', error);
    throw error;
  }
}

/**
 * Uploads a base64 image to Supabase Storage (placeholder - implement based on your storage setup)
 */
export async function uploadSnapshotToStorage(
  base64Image: string,
  _fileName: string
): Promise<string> {
  // TODO: Implement actual upload to Supabase Storage
  // For now, return the base64 data URL
  return base64Image;
}
