import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = '/models';

export async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  ]);
}

export async function getFaceDescriptor(videoElement: HTMLVideoElement) {
  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection ? Array.from(detection.descriptor) : null;
}

export function compareFaceDescriptors(descriptor1: number[], descriptor2: number[]) {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  return distance < 0.6; // Threshold for recognition
}
