const MODEL_URL = '/models';
let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;
let faceapi: any = null;

async function getFaceApi() {
  if (faceapi) return faceapi;
  if (typeof window === 'undefined') {
    throw new Error('Face API is only available in browser');
  }
  faceapi = await import('@vladmandic/face-api');
  return faceapi;
}

export async function loadModels() {
  if (typeof window === 'undefined') return;
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const api = await getFaceApi();
      await Promise.all([
        api.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        api.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        api.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        api.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded = true;
    } catch (error) {
      console.error("Failed to load face-api models:", error);
      loadingPromise = null;
      throw error;
    }
  })();

  return loadingPromise;
}

export async function getFaceDescriptor(videoElement: HTMLVideoElement) {
  if (typeof window === 'undefined') return null;
  const api = await getFaceApi();
  const detection = await api
    .detectSingleFace(videoElement, new api.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection ? Array.from(detection.descriptor) : null;
}

export async function compareFaceDescriptors(descriptor1: number[], descriptor2: number[]) {
  if (typeof window === 'undefined') return false;
  const api = await getFaceApi();
  const distance = api.euclideanDistance(descriptor1, descriptor2);
  return distance < 0.6;
}
