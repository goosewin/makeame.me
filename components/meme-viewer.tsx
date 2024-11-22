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

  return (
    <div className="flex flex-col items-center gap-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Image
            className="rounded-lg object-contain w-full h-96"
            src={generatedImageUrl 
              ? generatedImageUrl
              : meme.template_url.replace('/public', '')}
            width={400}
            height={400}
            alt={meme.description}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <CardTitle>{meme.name}</CardTitle>
          <CardDescription>{meme.description}</CardDescription>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter a prompt for the meme"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button 
              onClick={handleGenerateCaption} 
              disabled={loading || !prompt.trim()}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Meme'}
            </Button>
          </div>

          {caption && (
            <div className="mt-4 p-4 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-2">Edit Caption:</h3>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Edit your caption here..."
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Tip: Use newline to separate top and bottom text
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
