import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import type { MemeTemplate } from '@/app/data/memes';

interface MemeViewerProps {
  meme: MemeTemplate;
}

export function MemeViewer({ meme }: MemeViewerProps) {
  const [prompt, setPrompt] = useState('');
  const [caption, setCaption] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Debounce caption changes to prevent too many regenerations
  useEffect(() => {
    if (!caption) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/generateCaption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            memeId: meme.id, 
            prompt: null, // null prompt indicates manual caption update
            caption: caption 
          }),
        });

        if (!res.ok) throw new Error('Failed to update meme');

        const data = await res.json();
        setGeneratedImageUrl(data.imageUrl);
      } catch (error) {
        console.error('Error updating meme:', error);
        toast({
          title: 'Error',
          description: 'Failed to update meme. Please try again.',
          variant: 'destructive',
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [caption, meme.id, toast]);

  const handleGenerateCaption = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generateCaption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memeId: meme.id, prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to generate caption');
      }

      setCaption(data.caption);
      setGeneratedImageUrl(data.imageUrl);
      toast({
        title: 'Success',
        description: 'Meme generated successfully!',
      });
    } catch (error) {
      console.error('Error generating meme:', error);
      let errorMessage = error instanceof Error ? error.message : 'Failed to generate meme. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000, // Show error for longer
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && prompt.trim() && !loading) {
      handleGenerateCaption();
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-xl mx-auto p-4">
      <Card className="w-full bg-gray-800 border border-gray-700">
        <CardHeader className="space-y-4">
          <div className="relative aspect-square w-full max-h-[800px] rounded-lg overflow-hidden">
            <Image
              className="object-contain"
              src={generatedImageUrl 
                ? generatedImageUrl
                : meme.template_url.replace('/public', '')}
              fill
              alt={meme.description}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              {meme.name}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {meme.description}
            </CardDescription>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2 w-full">
              <Input
                type="text"
                placeholder="Enter a prompt for the meme"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <Button 
                onClick={handleGenerateCaption} 
                disabled={loading || !prompt.trim()}
                className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap px-6"
              >
                {loading ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>

          {caption && (
            <div className="mt-6 p-6 bg-gray-700 rounded-lg border border-gray-600">
              <h3 className="font-semibold mb-3 text-white">Edit Caption:</h3>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Edit your caption here..."
                className="min-h-[100px] bg-gray-800 border-gray-600 text-white mb-3"
              />
              <p className="text-sm text-gray-400">
                Tip: Use newline to separate top and bottom text
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
