import * as data from '../../annotated_memes.json';

export interface MemeTemplate {
  id: string;
  name: string;
  template_url: string;
  description: string;
  instructions: string;
  textPosition?: 'top' | 'bottom' | 'both'; // Default to 'top' if not specified
}

const memes: MemeTemplate[] = data.memes.map(meme => ({
  ...meme,
  // You can set default positions here, or manually specify for each meme
  textPosition: meme.id === '135256802' ? 'bottom' : 'top' // Epic Handshake meme at bottom
}));

export default memes;
