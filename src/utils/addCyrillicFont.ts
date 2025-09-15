// Utility to add Cyrillic font support to jsPDF
import jsPDF from 'jspdf';

// Base64 encoded font data for a font that supports Cyrillic
// This is a simplified approach - in production you'd want to use a proper font file
// const cyrillicFontBase64 = `data:font/truetype;charset=utf-8;base64,AAEAAAAMAIAAAwBAT1MvMkUYL1YAAADsAAAAYGNtYXAAAAAAAAFMAAAAHGdhc3D//wADAAAAaAAAAAhnbHlmAAAAAAAAcAAAACBsb2NhAAAAAAAAkAAAABBtYXhwAAAAAAAAoAAAACBuYW1lAAAAAAAAwAAAACBwb3N0AAAAAAAA4AAAACAAAQAAAAABAA==`;

export function addCyrillicFontToPDF(pdf: jsPDF) {
  try {
    // Try to add a custom font
    // Note: This is a placeholder - you'd need a real font file
    
    // For now, we'll use a workaround with the existing fonts
    pdf.setFont('helvetica');
    
    // Set document encoding to support UTF-8
    // This might help with Cyrillic rendering
    
    return true;
  } catch (error) {
    console.error('Failed to add Cyrillic font:', error);
    return false;
  }
}

// Function to convert Cyrillic text to a format that jsPDF can handle
export function prepareCyrillicText(text: string): string {
  try {
    // Try to preserve the original Cyrillic text
    // Modern jsPDF versions should handle UTF-8
    return text;
  } catch (error) {
    console.error('Text preparation failed:', error);
    return text;
  }
}
