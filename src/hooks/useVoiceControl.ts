import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useVoiceControl = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  
  const commands = [
    {
      command: ['go to *', 'open *', 'show me *'],
      callback: (page: string) => {
        const route = page.toLowerCase().replace(' ', '-');
        if (['elder', 'caregiver', 'clinician', 'family', 'support'].includes(route)) {
          navigate(`/${route}`);
          toast.success(`Navigating to ${page}`);
        } else {
          toast.error(`Unknown destination: ${page}`);
        }
      }
    },
    {
      command: 'help',
      callback: () => toast.info("You can say: 'Open Elder Portal', 'Go to Caregiver Dashboard', or 'Show me support'")
    }
  ];

  const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
      toast.info("Listening for commands...");
    }
  };

  return {
    isListening,
    transcript,
    toggleListening,
    browserSupportsSpeechRecognition
  };
};
