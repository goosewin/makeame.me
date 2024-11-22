import { openai } from '@/lib/openai';
import { generateText } from 'ai';
import memes from '@/app/data/memes';
import { generateMemeImage } from '@/lib/image-utils';

export async function POST(req: Request) {
  try {
    const { memeId, prompt, caption } = await req.json();

    // Find the meme template
    const meme = memes.find(m => m.id === memeId);
    if (!meme) {
      return new Response(JSON.stringify({ error: 'Meme template not found' }), {
        status: 404,
      });
    }

    let finalCaption: string;

    if (prompt) {
      // Generate new caption from prompt
      const chat = await openai.chat('gpt-4o-2024-11-20');
      const response = await generateText({
        model: chat,
        prompt: `Generate a creative and funny two-part caption for the "${meme.name}" meme based on this prompt: "${prompt}". 
        
        Format it as two lines separated by a newline character, where:
        - First line appears at the top of the image
        - Second line appears at the bottom of the image
        
        Keep each line short and impactful. Do not use emojis or any other text. Example format:
        First line here
        Second line here`,
      });
      finalCaption = response.text;
    } else {
      // Use provided caption for manual updates
      finalCaption = caption;
    }

    // Generate the meme image
    const generatedImageUrl = await generateMemeImage(
      meme.template_url,
      finalCaption,
      meme.id,
      meme.textPosition
    );

    // Return JSON response with caption and image URL
    return new Response(JSON.stringify({
      caption: finalCaption,
      imageUrl: generatedImageUrl
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating caption:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate caption' }), {
      status: 500,
    });
  }
}
