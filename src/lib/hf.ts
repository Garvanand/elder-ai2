/**
 * Utility for Hugging Face Inference API
 */

const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

export async function generateImage(prompt: string): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key is missing');
  }

  // Use a high-quality stable diffusion model
  const model = 'stabilityai/stable-diffusion-xl-base-1.0';
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      headers: { 
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate image');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Upload a blob to Supabase Storage and return public URL
 */
import { supabase } from '@/integrations/supabase/client';

export async function uploadGeneratedArt(blobUrl: string, userId: string): Promise<string> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  
  const fileName = `${userId}/art-${Date.now()}.png`;
  const { data, error } = await supabase.storage
    .from('memory-images')
    .upload(fileName, blob, {
      contentType: 'image/png'
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('memory-images')
    .getPublicUrl(fileName);

  return publicUrl;
}
