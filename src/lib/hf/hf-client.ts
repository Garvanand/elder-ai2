import { HfInference } from '@huggingface/inference';

export class HFManager {
  private client: HfInference;
  private cache: Map<string, any>;
  
  constructor(apiKey?: string) {
    const key = apiKey || process.env.VITE_HUGGINGFACE_API_KEY;
    this.client = new HfInference(key);
    this.cache = new Map();
  }
  
  async analyzeWithCache(model: string, input: any, cacheKey: string) {
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
    
    try {
      const result = await this.client.inference({
        model,
        inputs: input
      });
      
      this.cache.set(cacheKey, result);
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
}

export const hfManager = new HFManager();
