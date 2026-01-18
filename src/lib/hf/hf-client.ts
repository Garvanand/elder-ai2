import { HfInference } from '@huggingface/inference';
import { supabase } from '@/integrations/supabase/client';

export class HFManager {
  private client: HfInference;
  private cache: Map<string, any> = new Map();
  
  constructor() {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.warn('HUGGINGFACE_API_KEY is missing');
    }
    this.client = new HfInference(apiKey);
  }
  
  /**
   * Universal analyzer with smart retries and Supabase caching
   */
  async analyzeWithCache<T>(
    model: string, 
    input: any, 
    cacheKey: string, 
    task: 'textClassification' | 'imageClassification' | 'objectDetection' | 'audioClassification' | 'textToImage' | 'request' = 'request'
  ): Promise<T> {
    // 1. Check in-memory cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 2. Check Supabase cache
    const { data: cached } = await supabase
      .from('hf_inference_cache')
      .select('output')
      .eq('model_name', model)
      .eq('input_hash', cacheKey)
      .single();
      
    if (cached) {
      this.cache.set(cacheKey, cached.output);
      return cached.output as T;
    }
    
    // 3. Execute with retries
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        let result: any;

        // Use specialized SDK methods for better reliability and performance
        switch (task) {
          case 'textClassification':
            result = await this.client.textClassification({ model, inputs: input });
            break;
          case 'imageClassification':
            result = await this.client.imageClassification({ model, data: input });
            break;
          case 'objectDetection':
            result = await this.client.objectDetection({ model, data: input });
            break;
          case 'audioClassification':
            result = await this.client.audioClassification({ model, data: input });
            break;
          case 'textToImage':
            const blob = await this.client.textToImage({ model, inputs: input });
            result = blob;
            break;
          default:
            result = await this.client.request({
              model,
              inputs: input
            });
        }
        
        // 4. Store in Supabase cache (except for blobs/images)
        if (task !== 'textToImage') {
          await supabase.from('hf_inference_cache').upsert({
            model_name: model,
            input_hash: cacheKey,
            output: result,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
          this.cache.set(cacheKey, result);
        }
        
        return result as T;
      } catch (error: any) {
        lastError = error;
        
        // Handle 503 (Model Loading) specifically
        if (error.message?.includes('503') || error.status === 503) {
          const waitTime = error.estimated_time ? (error.estimated_time * 1000) : (10000 * (attempt + 1));
          console.warn(`HF Model [${model}] is loading. Retrying in ${Math.round(waitTime/1000)}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        console.error(`HF Inference Error [${model}] (Attempt ${attempt + 1}):`, error);
        
        if (attempt === maxRetries - 1) break;
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
      }
    }
    
    throw lastError;
  }

  getClient() {
    return this.client;
  }
}

export const hfManager = new HFManager();
