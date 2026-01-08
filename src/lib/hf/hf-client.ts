import { HfInference } from '@huggingface/inference';
import { supabase } from '@/integrations/supabase/client';

export class HFManager {
  private client: HfInference;
  private memoryCache: Map<string, any>;
  
  constructor(apiKey?: string) {
    const key = apiKey || (import.meta.env?.VITE_HUGGINGFACE_API_KEY as string);
    this.client = new HfInference(key);
    this.memoryCache = new Map();
  }
  
  async analyzeWithCache(model: string, input: any, cacheKey: string) {
    // 1. Check Memory Cache
    if (this.memoryCache.has(cacheKey)) return this.memoryCache.get(cacheKey);
    
    // 2. Check Database Cache
    try {
      const { data: cachedResult, error } = await supabase
        .from('hf_inference_cache' as any)
        .select('output')
        .eq('model_name', model)
        .eq('input_hash', cacheKey)
        .maybeSingle();

      if (cachedResult && !error) {
        this.memoryCache.set(cacheKey, cachedResult.output);
        return cachedResult.output;
      }
    } catch (e) {
      console.warn('DB Cache miss or error:', e);
    }

    // 3. Inference
    try {
      const result = await this.client.inference({
        model,
        inputs: input
      });
      
      // 4. Update Caches
      this.memoryCache.set(cacheKey, result);
      
      try {
        await supabase.from('hf_inference_cache' as any).insert({
          model_name: model,
          input_hash: cacheKey,
          output: result,
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() // 7 days
        });
      } catch (e) {
        console.warn('Failed to persist cache:', e);
      }

      return result;
    } catch (error) {
      console.error(`HF Error (${model}):`, error);
      throw error;
    }
  }

  async audioClassification(model: string, data: Blob | ArrayBuffer) {
    return this.client.audioClassification({
      model,
      data
    });
  }

  async visualQuestionAnswering(model: string, inputs: { image: Blob | ArrayBuffer, question: string }) {
    return this.client.visualQuestionAnswering({
      model,
      inputs
    });
  }

  async imageClassification(model: string, data: Blob | ArrayBuffer) {
    return this.client.imageClassification({
      model,
      data
    });
  }

  async objectDetection(model: string, data: Blob | ArrayBuffer) {
    return this.client.objectDetection({
      model,
      data
    });
  }

  async tokenClassification(model: string, inputs: string) {
    return this.client.tokenClassification({
      model,
      inputs
    });
  }

  async textClassification(model: string, inputs: string) {
    return this.client.textClassification({
      model,
      inputs
    });
  }
}

export const hfManager = new HFManager();
