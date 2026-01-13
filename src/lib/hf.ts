import { hfManager } from './hf/hf-client';
import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced prompt engineering for artistic visualization
 */
const ART_PROMPT_TEMPLATE = (story: string) => {
  return `An evocative, high-quality oil painting of the following scene: ${story}. Style: Dreamy, nostalgic, warm lighting, impressionistic brushstrokes, rich textures, 4k resolution, masterpiece. No text, no distorted faces.`;
};

export async function generateImage(story: string): Promise<string> {
  const enhancedPrompt = ART_PROMPT_TEMPLATE(story);
  
  try {
    // Use the consolidated hfManager with retries and 503 handling
    const blob = await hfManager.analyzeWithCache<Blob>(
      'stabilityai/stable-diffusion-xl-base-1.0',
      enhancedPrompt,
      `art_${btoa(story).slice(0, 16)}_${Date.now()}`,
      'textToImage'
    );
    
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error('Image generation failed after retries:', error);
    throw new Error(error.message || 'The AI artist is currently resting. Please try again in a moment.');
  }
}

/**
 * Upload a blob to Supabase Storage and return public URL
 */
export async function uploadGeneratedArt(blobUrl: string, userId: string): Promise<string> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  
  const fileName = `${userId}/art-${Date.now()}.png`;
  const { data, error } = await supabase.storage
    .from('memory-images')
    .upload(fileName, blob, {
      contentType: 'image/png'
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('memory-images')
    .getPublicUrl(fileName);

  return publicUrl;
}
