import { hfManager } from './hf-client';

export class ModelOrchestrator {
  // Voice Biomarkers (Emotion detection from audio)
  static async analyzeVoice(audioBlob: Blob, elderId: string) {
    const model = 'audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim';
    return await hfManager.analyzeWithCache(
      model,
      await audioBlob.arrayBuffer(),
      `voice_${elderId}_${Date.now()}`,
      'audioClassification'
    );
  }

  // Gait Analysis (Action recognition from video)
  static async analyzeGait(videoBlob: Blob, elderId: string) {
    const model = 'facebook/timesformer-base-finetuned-k400';
    return await hfManager.analyzeWithCache(
      model,
      await videoBlob.arrayBuffer(),
      `gait_${elderId}_${Date.now()}`,
      'imageClassification' // Timesformer uses image frames or specialized request
    );
  }

  // Sleep Quality / Sound Analysis
  static async analyzeSleep(audioBlob: Blob, elderId: string) {
    const model = 'MIT/ast-finetuned-audioset-10-10-0.4593';
    return await hfManager.analyzeWithCache(
      model,
      await audioBlob.arrayBuffer(),
      `sleep_${elderId}_${Date.now()}`,
      'audioClassification'
    );
  }

  // Pain Detection (Face expression analysis)
  static async detectPain(imageBlob: Blob, elderId: string) {
    const model = 'trpakov/vit-face-expression';
    return await hfManager.analyzeWithCache(
      model,
      await imageBlob.arrayBuffer(),
      `pain_${elderId}_${Date.now()}`,
      'imageClassification'
    );
  }

  // Medication ID (Object detection is better than simple classification)
  static async identifyPill(imageBlob: Blob, elderId: string) {
    const model = 'facebook/detr-resnet-50'; // Better for identifying objects in context
    return await hfManager.analyzeWithCache(
      model,
      await imageBlob.arrayBuffer(),
      `pill_${elderId}_${Date.now()}`,
      'objectDetection'
    );
  }

  // Document Intelligence (OCR + Layout)
  static async parseMedicalDoc(imageBlob: Blob, elderId: string) {
    const model = 'microsoft/layoutlmv3-base';
    return await hfManager.analyzeWithCache(
      model,
      await imageBlob.arrayBuffer(),
      `doc_${elderId}_${Date.now()}`,
      'request' // LayoutLM often requires specialized processing
    );
  }

  // Emotional Nuance Detector (GoEmotions is much more detailed than generic sentiment)
  static async detectLoneliness(text: string, elderId: string) {
    const model = 'SamLowe/roberta-base-go_emotions';
    return await hfManager.analyzeWithCache(
      model,
      text,
      `emotions_${elderId}_${btoa(text).slice(0, 16)}`,
      'textClassification'
    );
  }
}
