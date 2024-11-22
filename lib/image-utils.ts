import path from 'path';
import {HorizontalAlign, VerticalAlign, Jimp, loadFont, measureText} from 'jimp';
import { put } from '@vercel/blob';
import fs from 'fs';

// Helper function to ensure font path is valid
const getFontPath = (fontName: string) => {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', fontName, `${fontName}.fnt`);
  
  // Verify the font file exists
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font file not found: ${fontPath}`);
  }
  
  return fontPath;
};

// Define font paths
const FONT_PATHS = {
  SANS_32_WHITE: getFontPath('open-sans-32-white'),
  SANS_64_WHITE: getFontPath('open-sans-64-white'),
  SANS_128_WHITE: getFontPath('open-sans-128-white'),
} as const;

export async function generateMemeImage(
  templateUrl: string, 
  caption: string, 
  memeId: string,
): Promise<string> {
  try {
    console.log('Starting image generation with:', { templateUrl, caption, memeId });
    
    const imagePath = path.join(process.cwd(), 'public', templateUrl.replace('/public', ''));
    console.log('Resolved image path:', imagePath);
    
    // Check if file exists
    try {
      await fs.promises.access(imagePath);
    } catch (error) {
      console.error('Template file not found:', imagePath);
      throw new Error(`Template file not found: ${templateUrl}`);
    }

    const image = await Jimp.read(imagePath);
    console.log('Successfully loaded template image');
    
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // Split caption into top and bottom parts if it contains a line break
    const [topText, bottomText] = caption.split('\n').map(text => text.trim());
    
    // Try different font sizes until the text fits
    let font;
    let finalFontSize;
    
    // Get the longest line to determine font size
    const longestLine = [topText, bottomText].reduce((a, b) => 
      (a?.length || 0) > (b?.length || 0) ? a : b
    );
    
    try {
      font = await loadFont(FONT_PATHS.SANS_128_WHITE);
      finalFontSize = 128;
      
      if (measureText(font, longestLine) > width - 60) {
        font = await loadFont(FONT_PATHS.SANS_64_WHITE);
        finalFontSize = 64;
        
        if (measureText(font, longestLine) > width - 60) {
          font = await loadFont(FONT_PATHS.SANS_32_WHITE);
          finalFontSize = 32;
        }
      }
    } catch (error) {
      console.error('Error loading font:', error);
      // Fallback to smallest font if others fail
      font = await loadFont(FONT_PATHS.SANS_32_WHITE);
      finalFontSize = 32;
    }

    // Function to print wrapped text at a specific position
    const printWrappedText = (text: string, yPosition: number) => {
      if (!text) return;

      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = measureText(font, testLine);

        if (testWidth > width - 60 && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }

      let currentY = yPosition;
      const lineHeight = finalFontSize * 1.5;

      for (const line of lines) {
        // const textWidth = measureText(font, line);
        image.print({
          font,
          x: 0,
          y: Math.round(currentY),
          maxWidth: width,
          text: {
            text: line,
            alignmentX: HorizontalAlign.CENTER,
            alignmentY: VerticalAlign.TOP,
          },

        });
        currentY += lineHeight;
      }
    };

    // Print top text
    if (topText) {
      printWrappedText(topText, 30);
    }

    // Print bottom text
    if (bottomText) {
      const lineHeight = finalFontSize * 1.5;
      // const bottomWords = bottomText.split(' ');
      const estimatedLines = Math.ceil(measureText(font, bottomText) / (width - 60));
      const bottomY = height - (estimatedLines * lineHeight) - 30;
      printWrappedText(bottomText, bottomY);
    }

    // Instead of saving to filesystem, save to buffer
    const buffer = await image.getBuffer("image/jpeg");
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${memeId}-${timestamp}.jpg`;

    // Upload to Vercel Blob Storage
    const { url } = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    console.log('Successfully uploaded image to Blob Storage:', url);
    
    // Return the full URL instead of just the filename
    return url;
  } catch (error) {
    console.error('Error in generateMemeImage:', error);
    throw error;
  }
} 