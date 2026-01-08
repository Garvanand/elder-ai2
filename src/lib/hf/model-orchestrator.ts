import { hfManager } from './hf-client';

export class ModelOrchestrator {
  // Voice Biomarkers
  static async analyzeVoice(audioBlob: Blob, elderId: string) {
    const model = 'audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim';
    const result = await hfManager.analyzeWithCache(
      model,
      await audioBlob.arrayBuffer(),
      `voice_${elderId}_${Date.now()}`
    );
    return result;
  }

  // Gait Analysis (Video)
  static async analyzeGait(videoBlob: Blob, elderId: string) {
    const model = 'facebook/timesformer-base-finetuned-k400';
    const result = await hfManager.analyzeWithCache(
      model,
      await videoBlob.arrayBuffer(),
      `gait_${elderId}_${Date.now()}`
    );
    return result;
  }

  // Sleep Quality (Audio)
  static async analyzeSleep(audioBlob: Blob, elderId: string) {
    const model = 'MIT/ast-finetuned-audioset-10-10-0.4593';
    const result = await hfManager.analyzeWithCache(
      model,
      await audioBlob.arrayBuffer(),
      `sleep_${elderId}_${Date.now()}`
    );
    return result;
  }

  // Pain Detection (Image/Video Frame)
  static async detectPain(imageBlob: Blob, elderId: string) {
    const model = 'trpakov/vit-face-expression';
    const result = await hfManager.analyzeWithCache(
      model,
      await imageBlob.arrayBuffer(),
      `pain_${elderId}_${Date.now()}`
    );
    return result;
  }

  // Medication ID (Image)
  static async identifyPill(imageBlob: Blob, elderId: string) {
    const model = 'microsoft/resnet-50';
    const result = await hfManager.analyzeWithCache(
      model,
      await imageBlob.arrayBuffer(),
      `pill_${elderId}_${Date.now()}`
    );
    return result;
  }

  // Document Intelligence
  static async parseMedicalDoc(imageBlob: Blob, elderId: string) {
    const model = 'microsoft/layoutlmv3-base';
    const result = await hfManager.analyzeWithCache(
      model,
      await imageBlob.arrayBuffer(),
      `doc_${elderId}_${Date.now()}`
    );
    return result;
  }

  // Loneliness Detector (Text)
  static async detectLoneliness(text: string, elderId: string) {
    const model = 'cardiffnlp/twitter-roberta-base-sentiment-latest';
    const result = await hfManager.analyzeWithCache(
      model,
      text,
      `loneliness_${elderId}_${btoa(text).slice(0, 16)}`
    );
    return result;
  }
}
