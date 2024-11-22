import { openai } from '@/lib/openai';
import { generateText } from 'ai';
import memes from '@/app/data/memes';
import { generateMemeImage } from '@/lib/image-utils';

export async function POST(req: Request) {
  try {
    const { memeId, prompt, caption } = await req.json();
    console.log('Received request:', { memeId, prompt, caption });

    // Find the meme template
    const meme = memes.find(m => m.id === memeId);
    if (!meme) {
      console.error('Meme not found:', memeId);
      return new Response(JSON.stringify({ error: 'Meme template not found' }), {
        status: 404,
      });
    }

    let finalCaption: string;

    if (prompt) {
      try {
        console.log('Generating caption with prompt:', prompt);
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
        console.log('Generated caption:', finalCaption);
      } catch (error) {
        console.error('Error generating caption with OpenAI:', error);
        throw new Error('Failed to generate caption with AI');
      }
    } else {
      finalCaption = caption;
      console.log('Using manual caption:', finalCaption);
    }

    try {
      console.log('Generating image with template:', meme.template_url);
      const generatedImageUrl = await generateMemeImage(
        meme.template_url,
        finalCaption,
        meme.id
      );
      console.log('Generated image URL:', generatedImageUrl);

      return new Response(JSON.stringify({
        caption: finalCaption,
        imageUrl: generatedImageUrl
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error generating meme image:', error);
      throw new Error('Failed to generate meme image');
    }

  } catch (error) {
    console.error('Error in generateCaption route:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate caption',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
    });
  }
}
