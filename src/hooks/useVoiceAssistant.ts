
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sendVoiceMessage, AssessmentFeedback } from '@/api/voiceAssistant';

interface ConversationMessage {
  type: 'user' | 'ai';
  text: string;
  assessment?: AssessmentFeedback;
}

export const useVoiceAssistant = (
  lessonTitle?: string,
  lessonContent?: string,
  assessmentMode = true,
  onAssessmentUpdate?: (assessment: AssessmentFeedback) => void
) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [assessment, setAssessment] = useState<AssessmentFeedback | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSupported(false);
      console.log('Speech recognition not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    if (recognitionRef.current) {
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event) => {
        const speechResult = event.results[0][0].transcript;
        console.log('Speech recognized:', speechResult);
        setTranscript(speechResult);
        setIsProcessing(true);
        
        // Add user message to conversation immediately
        setConversation(prev => [...prev, { type: 'user', text: speechResult }]);
        
        try {
          const response = await sendVoiceMessage({
            message: speechResult,
            context: lessonTitle || 'General learning session',
            lessonContent: lessonContent || '',
            assessmentMode,
          });
          
          console.log('AI response received:', response);
          setAiResponse(response.response);
          
          // Update assessment state
          if (response.assessment) {
            setAssessment(response.assessment);
            console.log('Assessment received:', response.assessment);
            
            // Notify parent component of assessment update
            if (onAssessmentUpdate) {
              onAssessmentUpdate(response.assessment);
            }
          }
          
          // Add AI response to conversation with assessment
          setConversation(prev => [...prev, { 
            type: 'ai', 
            text: response.response,
            assessment: response.assessment 
          }]);
          
          // Speak the AI response
          speakText(response.response);
          
        } catch (error: any) {
          console.error('Error getting AI response:', error);
          const errorMessage = error.message || 'Failed to get AI response';
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
        
        let errorMessage = "Please try again or check your microphone permissions.";
        if (event.error === 'no-speech') {
          errorMessage = "No speech detected. Please speak clearly into your microphone.";
        } else if (event.error === 'network') {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (event.error === 'not-allowed') {
          errorMessage = "Microphone access denied. Please enable microphone permissions.";
        }
        
        toast({
          title: "Speech Recognition Error",
          description: errorMessage,
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [lessonTitle, lessonContent, assessmentMode, toast, onAssessmentUpdate]);

  const startListening = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (recognitionRef.current && !isListening) {
        setIsListening(true);
        recognitionRef.current.start();
        console.log('Started listening...');
      }
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice features.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log('Stopped listening');
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        console.log('Started speaking');
      };
      utterance.onend = () => {
        setIsPlaying(false);
        console.log('Finished speaking');
      };
      utterance.onerror = (error) => {
        setIsPlaying(false);
        console.error('Speech synthesis error:', error);
      };
      
      speechSynthRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return {
    isListening,
    isPlaying,
    transcript,
    aiResponse,
    assessment,
    conversation,
    isSupported,
    isProcessing,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  };
};
