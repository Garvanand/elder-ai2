import { HfInference } from '@huggingface/inference';
import { supabase } from '@/integrations/supabase/client';

export class HFManager {
  private client: HfInference;
  
  constructor() {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.warn('HUGGINGFACE_API_KEY is missing');
    }
    this.client = new HfInference(apiKey);
  }
  
  async analyzeWithCache(model: string, input: any, cacheKey: string) {
    // Check Supabase cache first
    const { data: cached } = await supabase
      .from('hf_inference_cache')
      .select('output')
      .eq('model_name', model)
      .eq('input_hash', cacheKey)
      .single();
      
    if (cached) return cached.output;
    
    try {
      const result = await this.client.request({
        model,
        inputs: input
      });
      
      // Store in cache
      await supabase.from('hf_inference_cache').insert({
        model_name: model,
        input_hash: cacheKey,
        output: result,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });
      
      return result;
    } catch (error) {
      console.error(`HF Inference Error [${model}]:`, error);
      throw error;
    }
  }

  getClient() {
    return this.client;
  }
}

export const hfManager = new HFManager();
