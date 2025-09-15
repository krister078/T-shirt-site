'use client';

import { useState, useRef, useEffect } from 'react';

interface TShirtDesignerProps {
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
  onChange: (updates: { designs?: TShirtDesignerProps['designs']; currentView?: 'front' | 'back' }) => void;
}

export function TShirtDesigner({ 
  color, 
  designs, 
  currentView, 
  onChange 
}: TShirtDesignerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotationStart, setRotationStart] = useState(0);
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null);
  const [designUrls, setDesignUrls] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert files to URLs for display
  useEffect(() => {
    const currentDesigns = designs[currentView];
    const newUrls: Record<string, string> = {};
    
    currentDesigns.forEach(design => {
      if (!designUrls[design.id]) {
        newUrls[design.id] = URL.createObjectURL(design.file);
      } else {
        newUrls[design.id] = designUrls[design.id];
      }
    });

    // Clean up old URLs
    Object.keys(designUrls).forEach(id => {
      if (!currentDesigns.find(d => d.id === id)) {
        URL.revokeObjectURL(designUrls[id]);
      }
    });

    setDesignUrls(newUrls);

    return () => {
      Object.values(newUrls).forEach(url => {
        if (!designUrls[url]) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [designs, currentView, designUrls]);

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize' | 'rotate', designId: string) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const design = designs[currentView].find(d => d.id === designId);
    if (!design) return;

    setActiveDesignId(designId);

    if (action === 'drag') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - rect.left - design.position.x,
        y: e.clientY - rect.top - design.position.y
      });
    } else if (action === 'resize') {
      setIsResizing(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    } else if (action === 'rotate') {
      setIsRotating(true);
      const centerX = design.position.x + design.size.width / 2;
      const centerY = design.position.y + design.size.height / 2;
      const angle = Math.atan2(
        e.clientY - rect.top - centerY,
        e.clientX - rect.left - centerX
      );
      setRotationStart(angle - (design.rotation * Math.PI / 180));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !activeDesignId) return;
    const rect = containerRef.current.getBoundingClientRect();

    const design = designs[currentView].find(d => d.id === activeDesignId);
    if (!design) return;

    if (isDragging) {
      // Allow free movement anywhere - minimal constraints to keep some part visible
      const newX = e.clientX - rect.left - dragStart.x;
      const newY = e.clientY - rect.top - dragStart.y;
      
      const updatedDesigns = {
        ...designs,
        [currentView]: designs[currentView].map(d => 
          d.id === activeDesignId 
            ? { ...d, position: { x: newX, y: newY } }
            : d
        )
      };
      
      onChange({ designs: updatedDesigns });
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const delta = Math.max(deltaX, deltaY);
      
      // Allow much larger sizes - from 20px minimum to 500px maximum
      const newWidth = Math.max(20, Math.min(500, design.size.width + delta));
      const newHeight = Math.max(20, Math.min(500, design.size.height + delta));
      
      const updatedDesigns = {
        ...designs,
        [currentView]: designs[currentView].map(d => 
          d.id === activeDesignId 
            ? { ...d, size: { width: newWidth, height: newHeight } }
            : d
        )
      };
      
      onChange({ designs: updatedDesigns });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isRotating) {
      const centerX = design.position.x + design.size.width / 2;
      const centerY = design.position.y + design.size.height / 2;
      const angle = Math.atan2(
        e.clientY - rect.top - centerY,
        e.clientX - rect.left - centerX
      );
      const rotation = ((angle - rotationStart) * 180 / Math.PI) % 360;
      
      const updatedDesigns = {
        ...designs,
        [currentView]: designs[currentView].map(d => 
          d.id === activeDesignId 
            ? { ...d, rotation: rotation }
            : d
        )
      };
      
      onChange({ designs: updatedDesigns });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setActiveDesignId(null);
  };

  const resetDesigns = () => {
    const updatedDesigns = {
      ...designs,
      [currentView]: designs[currentView].map(d => ({
        ...d,
        position: { x: 50, y: 40 },
        size: { width: 200, height: 200 }
      }))
    };
    onChange({ designs: updatedDesigns });
  };

  return (
    <div className="space-y-6">
      {/* Designer Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-slate-800">T-Shirt Preview</h3>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => onChange({ currentView: 'front' })}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                  currentView === 'front'
                    ? 'bg-white text-slate-800 shadow-sm ring-2 ring-blue-500'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Front
              </button>
              <button
                onClick={() => onChange({ currentView: 'back' })}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                  currentView === 'back'
                    ? 'bg-white text-slate-800 shadow-sm ring-2 ring-blue-500'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Back
              </button>
            </div>
          </div>
          {designs[currentView].length > 0 && (
            <button
              onClick={resetDesigns}
              className="text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
            >
              Reset Positions
            </button>
          )}
        </div>

        {/* T-Shirt Canvas */}
        <div className="flex justify-center">
          <div
            ref={containerRef}
            className="relative rounded-lg p-8 cursor-crosshair select-none"
            style={{ 
              width: '500px', 
              height: '600px',
              background: `
                linear-gradient(45deg, #f1f5f9 25%, transparent 25%), 
                linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #f1f5f9 75%), 
                linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* T-Shirt Clipping Mask */}
            <svg
              width="300"
              height="400"
              viewBox="0 0 300 400"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: 0 }}
            >
              <defs>
                <clipPath id="tshirt-clip">
                  <path d="M60 90 L60 370 Q60 380 70 380 L230 380 Q240 380 240 370 L240 90 L220 90 L220 60 Q220 45 205 45 L95 45 Q80 45 80 60 L80 90 Z" />
                </clipPath>
              </defs>
            </svg>
            {/* T-Shirt Shape */}
            <svg
              width="300"
              height="400"
              viewBox="0 0 300 400"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: 1 }}
            >
              <defs>
                {/* Realistic gradient for fabric depth */}
                <linearGradient id="tshirt-fabric-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color} />
                  <stop offset="100%" stopColor={color} stopOpacity="0.85" />
                </linearGradient>
                {/* Subtle shadow */}
                <filter id="fabric-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="1" dy="3" stdDeviation="2" floodOpacity="0.1"/>
                </filter>
              </defs>
              
              <g filter="url(#fabric-shadow)">
                {/* Main T-Shirt Body - Realistic proportions like the photo */}
                <path
                  d="M60 90 
                     L60 370 
                     Q60 380 70 380 
                     L230 380 
                     Q240 380 240 370 
                     L240 90 
                     L220 90 
                     L220 60 
                     Q220 45 205 45 
                     L95 45 
                     Q80 45 80 60 
                     L80 90 
                     Z"
                  fill="url(#tshirt-fabric-gradient)"
                  stroke="#d1d5db"
                  strokeWidth="1"
                />
                
                {/* Left Sleeve - Extra wide and longer realistic shape */}
                <path
                  d="M60 90 
                     L0 100 
                     L10 170 
                     L60 165 
                     Z"
                  fill="url(#tshirt-fabric-gradient)"
                  stroke="#d1d5db"
                  strokeWidth="1"
                />
                
                {/* Right Sleeve - Extra wide and longer realistic shape */}
                <path
                  d="M240 90 
                     L300 100 
                     L290 170 
                     L240 165 
                     Z"
                  fill="url(#tshirt-fabric-gradient)"
                  stroke="#d1d5db"
                  strokeWidth="1"
                />
                
                {currentView === 'front' ? (
                  /* Lower Neckline - Deeper crew neck for front */
                  <path
                    d="M95 45 Q150 80 205 45"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="1"
                  />
                ) : (
                  /* Back neckline - Slightly lower for back */
                  <path
                    d="M95 45 Q150 55 205 45"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="1"
                  />
                )}
                
                {/* Subtle seam lines for realism */}
                <line x1="60" y1="90" x2="60" y2="370" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.6"/>
                <line x1="240" y1="90" x2="240" y2="370" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.6"/>
              </g>
            </svg>

            {/* Design Overlays - Free Movement Anywhere */}
            <div
              className="absolute inset-0"
              style={{ zIndex: 2 }}
            >
              {designs[currentView].map((design) => (
                <div
                  key={design.id}
                  className="absolute cursor-move group"
                  style={{
                    left: `${design.position.x}px`,
                    top: `${design.position.y}px`,
                    width: `${design.size.width}px`,
                    height: `${design.size.height}px`,
                    zIndex: activeDesignId === design.id ? 10 : 1,
                    transform: `rotate(${design.rotation || 0}deg)`,
                    transformOrigin: 'center center',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'drag', design.id)}
                >
                  <img
                    src={designUrls[design.id]}
                    alt="Design"
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                  
                  {/* Resize Handle */}
                  <div
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-2 border-white shadow-md"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, 'resize', design.id);
                    }}
                  />
                  
                  {/* Rotation Handle */}
                  <div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full cursor-grab opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-2 border-white shadow-md flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, 'rotate', design.id);
                    }}
                    title="Rotate design"
                  >
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Selection Border */}
                  <div className="absolute inset-0 border-2 border-blue-500 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Instructions - Below Canvas */}
        {designs[currentView].length === 0 && (
          <div className="flex justify-center mt-6">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-200 max-w-md">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-slate-800 mb-2">Upload designs for the {currentView}</h4>
              <p className="text-sm text-slate-600">Your designs will appear on the t-shirt above and you can drag, resize, and rotate them anywhere on the canvas</p>
            </div>
          </div>
        )}

        {/* Design Controls */}
        {designs[currentView].length > 0 && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Design Controls ({currentView})</h4>
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {designs[currentView].map((design, index) => (
                <div key={design.id} className="grid grid-cols-3 gap-4 text-sm p-2 bg-white rounded border">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Design {index + 1} Position</label>
                    <p className="text-slate-800">X: {Math.round(design.position.x)}px, Y: {Math.round(design.position.y)}px</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Size</label>
                    <p className="text-slate-800">{Math.round(design.size.width)} × {Math.round(design.size.height)}px</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Rotation</label>
                    <p className="text-slate-800">{Math.round(design.rotation || 0)}°</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-500">
              💡 Tip: Drag to move, blue circle to resize, green circle to rotate. Multiple designs supported!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
