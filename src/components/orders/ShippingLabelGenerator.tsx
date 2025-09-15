'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OrderWithItems } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/client';

interface ShippingLabelGeneratorProps {
  order: OrderWithItems;
}

export function ShippingLabelGenerator({ order }: ShippingLabelGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const supabase = createClient();

  const generateShippingLabel = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch user profile to get the actual name
      let fullName = 'Customer Name';
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', order.user_id)
          .single();
          
        if (profile && (profile.first_name || profile.last_name)) {
          fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        }
      } catch (error) {
        console.log('Could not fetch user profile for PDF, using fallback name');
      }
      
      // Prepare address data
      const addressLines = [];
      
      // Add city and state
      if (order.shipping_city && order.shipping_state) {
        addressLines.push(`${order.shipping_city}, ${order.shipping_state}`);
      }
      
      // Add street address (including Cyrillic)
      if (order.shipping_street) {
        if (order.shipping_street.toLowerCase() === 'asd' || 
            order.shipping_street.toLowerCase() === 'test' ||
            order.shipping_street.trim() === '') {
          addressLines.push('Street Address');
        } else {
          addressLines.push(order.shipping_street);
        }
      }
      
      // Add ZIP code
      if (order.shipping_zip_code && order.shipping_zip_code !== 'asd') {
        addressLines.push(order.shipping_zip_code);
      }

      const sizes = order.order_items.map(item => item.size).join(', ');
      
      // Create HTML content for the shipping label with Cyrillic support
      const labelContent = document.createElement('div');
      labelContent.style.fontFamily = 'Arial, sans-serif';
      labelContent.style.width = '420px';
      labelContent.style.padding = '0';
      labelContent.style.backgroundColor = 'white';
      labelContent.innerHTML = `
        <div style="border: 2px solid black; padding: 20px; margin-bottom: 20px; width: 380px; height: 240px; position: relative; box-sizing: border-box;">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: black;">${fullName}</div>
          <div style="font-size: 16px; margin-bottom: 10px; color: black;">${order.shipping_phone || '081 234 5678'}</div>
          <div style="font-size: 14px; line-height: 1.4; color: black;">
            ${addressLines.join('<br>')}
          </div>
          <div style="font-size: 14px; margin-top: 15px; font-weight: bold; color: black;">${sizes}</div>
          <div style="position: absolute; bottom: 10px; right: 10px; font-size: 12px; color: black;">Order: ${order.order_number}</div>
        </div>
        <div style="border: 2px solid black; padding: 20px; width: 380px; height: 240px; position: relative; box-sizing: border-box;">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: black;">${fullName}</div>
          <div style="font-size: 16px; margin-bottom: 10px; color: black;">${order.shipping_phone || '081 234 5678'}</div>
          <div style="font-size: 14px; line-height: 1.4; color: black;">
            ${addressLines.join('<br>')}
          </div>
          <div style="font-size: 14px; margin-top: 15px; font-weight: bold; color: black;">${sizes}</div>
          <div style="position: absolute; bottom: 10px; right: 10px; font-size: 12px; color: black;">Order: ${order.order_number}</div>
        </div>
      `;
      
      // Temporarily add to DOM for rendering (hidden)
      labelContent.style.position = 'absolute';
      labelContent.style.left = '-9999px';
      labelContent.style.top = '-9999px';
      document.body.appendChild(labelContent);
      
      // Convert HTML to canvas with high quality
      const canvas = await html2canvas(labelContent, {
        scale: 3, // High resolution
        useCORS: true,
        allowTaint: false,
        backgroundColor: 'white',
        width: 420,
        height: 520
      });
      
      // Remove from DOM
      document.body.removeChild(labelContent);
      
      // Create PDF from canvas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      pdf.setProperties({
        title: `Shipping Label - ${order.order_number}`,
        creator: 'T4U T-shirt Store'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit nicely on A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Scale to fit width with some margin
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image
      const x = (pdfWidth - imgWidth) / 2;
      const y = 20; // 20mm from top
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`shipping-label-${order.order_number}.pdf`);
      
    } catch (error) {
      console.error('Error generating shipping label:', error);
      alert('Failed to generate shipping label. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateShippingLabel}
      disabled={isGenerating}
      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors text-sm font-medium"
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Generating...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Generate Shipping Label
        </>
      )}
    </button>
  );
}