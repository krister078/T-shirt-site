'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { ColorWheel } from '@/components/ui/ColorWheel';

interface TShirtFormProps {
  data: {
    label: string;
    description: string;
    price: number;
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
  };
  onChange: (field: string, value: any) => void;
}

export function TShirtForm({ data, onChange }: TShirtFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      // Validate file type
      const validTypes = ['image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: Please upload a PNG or SVG file`);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}: File size must be less than 5MB`);
        return;
      }

      // Add to current view
      const newDesign = {
        file,
        position: { x: 50, y: 40 },
        size: { width: 200, height: 200 },
        rotation: 0,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      };

      const currentDesigns = data.designs[data.currentView];
      const updatedDesigns = {
        ...data.designs,
        [data.currentView]: [...currentDesigns, newDesign]
      };

      onChange('designs', updatedDesigns);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveDesign = (designId: string) => {
    const currentDesigns = data.designs[data.currentView];
    const updatedDesigns = {
      ...data.designs,
      [data.currentView]: currentDesigns.filter(d => d.id !== designId)
    };
    onChange('designs', updatedDesigns);
  };


  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <Input
            label="T-Shirt Label"
            name="label"
            type="text"
            value={data.label}
            onChange={(e) => onChange('label', e.target.value)}
            placeholder="Enter a catchy name for your t-shirt"
            required
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={data.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Describe your t-shirt design..."
              rows={4}
              className="flex w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-md disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-300 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={data.price}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || value === '-') {
                  onChange('price', 19.99);
                } else {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue) && numValue >= 0) {
                    onChange('price', numValue);
                  }
                }
              }}
              onKeyDown={(e) => {
                // Prevent minus key from being entered
                if (e.key === '-' || e.key === 'Minus') {
                  e.preventDefault();
                }
              }}
              placeholder="19.99"
              min="0"
              step="0.01"
              className="flex w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-md disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Design Upload Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Design Upload</h3>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => onChange('currentView', 'front')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                data.currentView === 'front'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Front ({data.designs.front.length})
            </button>
            <button
              onClick={() => onChange('currentView', 'back')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                data.currentView === 'back'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Back ({data.designs.back.length})
            </button>
          </div>
        </div>
        
        {/* Upload Area */}
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200 mb-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-slate-800 mb-2">Upload designs for {data.currentView}</h4>
          <p className="text-xs text-slate-500 mb-4">PNG or SVG files up to 5MB (multiple files supported)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.svg"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Choose Files
          </button>
        </div>

        {/* Uploaded Designs */}
        {data.designs[data.currentView].length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">Uploaded Designs ({data.currentView})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.designs[data.currentView].map((design) => (
                <div key={design.id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{design.file.name}</p>
                        <p className="text-xs text-slate-500">{(design.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDesign(design.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Color Selection Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">T-Shirt Color</h3>
        <ColorWheel
          value={data.color}
          onChange={(color) => onChange('color', color)}
          size={180}
        />
      </div>
    </div>
  );
}
