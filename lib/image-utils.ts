import path from 'path';
import {HorizontalAlign, VerticalAlign, Jimp, loadFont, measureText} from 'jimp';
// import {SANS_128_WHITE, SANS_64_WHITE, SANS_32_WHITE} from 'jimp/fonts';
import fs from 'fs';

const plugin = require.resolve('jimp/fonts');
const jimpFont = path.resolve(plugin, '../../fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt');
// SANS_128_WHITE // fonts/open-sans/open-sans-128-white/open-sans-128-white.fnt
// resolve using a static string instead of using whatever jimp fonts gives at runtime
// i copied exact fonts into my public/fonts with a directory containing fnt for each size and color
// create variables for each font
const SANS_32_WHITE = path.join(process.cwd(), 'public', 'fonts', 'open-sans-32-white', 'open-sans-32-white.fnt');
const SANS_64_WHITE = path.join(process.cwd(), 'public', 'fonts', 'open-sans-64-white', 'open-sans-64-white.fnt');
const SANS_128_WHITE = path.join(process.cwd(), 'public', 'fonts', 'open-sans-128-white', 'open-sans-128-white.fnt');


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
      font = await loadFont(SANS_128_WHITE);
      finalFontSize = 128;
      
      if (measureText(font, longestLine) > width - 60) {
        font = await loadFont(SANS_64_WHITE);
        finalFontSize = 64;
        
        if (measureText(font, longestLine) > width - 60) {
          font = await loadFont(SANS_32_WHITE);
          finalFontSize = 32;
        }
      }
    } catch (error) {
      console.error('Error loading font:', error);
      font = await loadFont(SANS_64_WHITE);
      finalFontSize = 64;
    }

    // load impact font from public/fonts/impact.fnt
    // const impactFont = await loadFont(path.join(process.cwd(), 'public', 'fonts', 'impact.fnt'));

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
          // font: impactFont,
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

    const timestamp = Date.now();
    const newImagePath = `${memeId}-${timestamp}`;
    const fullSavePath = path.join(process.cwd(), 'public', 'generated', newImagePath);
    
    // Ensure generated directory exists
    try {
      await fs.promises.mkdir(path.join(process.cwd(), 'public', 'generated'), { recursive: true });
    } catch (error) {
      console.error('Error creating generated directory:', error);
      throw new Error('Failed to create generated directory');
    }
    
    console.log('Saving generated image to:', fullSavePath);
    await image.write(`${fullSavePath}.jpg`);
    console.log('Successfully saved generated image');
    
    return newImagePath;
  } catch (error) {
    console.error('Error in generateMemeImage:', error);
    throw error;
  }
} 