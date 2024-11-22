import * as jsonData from '../../annotated_memes.json';

export interface MemeTemplate {
  id: string;
  name: string;
  template_url: string;
  description: string;
  instructions?: string;
  textPosition?: 'top' | 'bottom' | 'both';
}

// Access the nested memes array from the JSON structure
const memes: MemeTemplate[] = (jsonData.memes as MemeTemplate[]).map(meme => ({
  ...meme,
  // Convert the meme data to match our template
  template_url: `/memes/${meme.id}_${meme.name.replace(/\s+/g, '_')}.jpg`,
  description: `${meme.name} meme template`,
  instructions: 'Add your caption',
  // Set text position based on meme ID
  textPosition: meme.id === '135256802' ? 'bottom' : 'top' // Epic Handshake meme at bottom
}));

export default memes;
