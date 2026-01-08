import { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useVoiceControl = () => {
  const navigate = useNavigate();
  const commands = [
    {
      command: 'go to *',
      callback: (page: string) => {
        const target = page.toLowerCase();
        if (target.includes('dashboard')) navigate('/clinician');
        else if (target.includes('records')) navigate('/clinician');
        else if (target.includes('settings')) navigate('/settings');
        toast(`Navigating to ${page}`);
      }
    },
    {
      command: 'show cognitive scores',
      callback: () => {
        toast("Displaying cognitive analysis...");
        // Logic to trigger view change could go here
      }
    },
    {
      command: 'emergency',
      callback: () => {
        toast.error("EMERGENCY PROTOCOL ACTIVATED");
        // Logic for emergency alert
      }
    }
  ];

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });

  const startListening = () => SpeechRecognition.startListening({ continuous: true });
  const stopListening = SpeechRecognition.stopListening;

  return {
    transcript,
    listening,
    resetTranscript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition
  };
};
