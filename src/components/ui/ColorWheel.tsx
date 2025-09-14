'use client';

import { useState, useRef, useEffect } from 'react';

interface ColorWheelProps {
  value: string;
  onChange: (color: string) => void;
  size?: number;
}

export function ColorWheel({ value, onChange, size = 200 }: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert hex to HSV
  const hexToHsv = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : diff / max;
    const v = max;

    return { h, s: s * 100, v: v * 100 };
  };

  // Convert HSV to hex
  const hsvToHex = (h: number, s: number, v: number) => {
    s /= 100;
    v /= 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Draw the color wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw color wheel
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = angle * Math.PI / 180;

      for (let r = 0; r < radius; r += 1) {
        const saturation = r / radius * 100;
        const color = hsvToHex(angle, saturation, 100);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, startAngle, endAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw current color indicator
    const currentHsv = hexToHsv(value);
    const indicatorRadius = (currentHsv.s / 100) * radius;
    const indicatorAngle = (currentHsv.h * Math.PI) / 180;
    const indicatorX = centerX + indicatorRadius * Math.cos(indicatorAngle);
    const indicatorY = centerY + indicatorRadius * Math.sin(indicatorAngle);

    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = value;
    ctx.fill();
  }, [value, size]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleColorChange(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleColorChange(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleColorChange = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius) {
      let angle = Math.atan2(dy, dx) * 180 / Math.PI;
      if (angle < 0) angle += 360;

      const saturation = Math.min(distance / radius * 100, 100);
      const newColor = hsvToHex(angle, saturation, 100);
      onChange(newColor);
    }
  };

  // Popular t-shirt colors for quick selection
  const popularColors = [
    '#ffffff', '#000000', '#1e3a8a', '#dc2626', '#16a34a', '#9333ea',
    '#ec4899', '#eab308', '#ea580c', '#6b7280', '#7f1d1d', '#0d9488'
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="cursor-crosshair rounded-full shadow-lg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      
      {/* Current color display */}
      <div className="flex items-center justify-center gap-3">
        <div
          className="w-12 h-12 rounded-lg border-2 border-slate-200 shadow-sm"
          style={{ backgroundColor: value }}
        />
        <div>
          <p className="text-sm font-medium text-slate-800">Selected Color</p>
          <p className="text-xs text-slate-500 font-mono">{value.toUpperCase()}</p>
        </div>
      </div>

      {/* Popular colors */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Popular T-Shirt Colors</p>
        <div className="grid grid-cols-6 gap-2">
          {popularColors.map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={`w-8 h-8 rounded-md border-2 transition-all duration-200 hover:scale-110 ${
                value === color
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
