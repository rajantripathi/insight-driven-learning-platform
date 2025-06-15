
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, Brain, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendVoiceMessage, AssessmentFeedback } from '@/api/voiceAssistant';

interface VoiceAssistantProps {
  lessonTitle?: string;
  lessonContent?: string;
  assessmentMode?: boolean;
  onAssessmentUpdate?: (assessment: AssessmentFeedback) => void;
}

export const VoiceAssistant = ({ 
  lessonTitle, 
  lessonContent, 
  assessmentMode = true,
  onAssessmentUpdate 
}: VoiceAssistantProps) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [assessment, setAssessment] = useState<AssessmentFeedback | null>(null);
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', text: string, assessment?: AssessmentFeedback}>>([]);
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

  const getAssessmentIcon = (assessment: AssessmentFeedback) => {
    if (assessment.understoodConcept) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Voice Features Not Supported</h3>
          <p className="text-gray-600">
            Your browser doesn't support voice recognition. Please use Chrome or Edge for the best experience.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Voice Learning Assistant
          {assessmentMode && <Badge variant="secondary">Assessment Mode</Badge>}
        </CardTitle>
        <CardDescription>
          {lessonTitle ? `Learning: ${lessonTitle}` : 'Ask me anything about your studies!'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Learning Progress */}
        {assessment && assessmentMode && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Learning Assessment</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={assessment.understoodConcept ? "default" : "secondary"} className="flex items-center gap-1">
                  {getAssessmentIcon(assessment)}
                  Understanding: {assessment.understoodConcept ? 'Good' : 'Needs Review'}
                </Badge>
                <Badge variant="outline">
                  Engagement: {assessment.engagementLevel}
                </Badge>
                {assessment.needsMorePractice && (
                  <Badge variant="destructive">Needs More Practice</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversation History */}
        <div className="max-h-60 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
          {conversation.length === 0 ? (
            <div className="text-center py-8">
              <Mic className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Start speaking to begin your learning session!</p>
              <p className="text-sm text-gray-400 mt-1">I'll help you learn and assess your understanding</p>
            </div>
          ) : (
            conversation.map((msg, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                msg.type === 'user' ? 'bg-blue-100 ml-6' : 'bg-green-100 mr-6'
              }`}>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-sm">
                    {msg.type === 'user' ? 'You:' : 'AI:'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{msg.text}</p>
                    {msg.assessment && assessmentMode && (
                      <div className="flex gap-1 mt-2">
                        <Badge size="sm" variant={msg.assessment.understoodConcept ? "default" : "secondary"}>
                          {getAssessmentIcon(msg.assessment)}
                          {msg.assessment.understoodConcept ? 'Understood' : 'Review needed'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Voice Controls */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            size="lg"
            disabled={!isSupported || isProcessing}
          >
            {isListening ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
            {isProcessing ? 'Processing...' : isListening ? 'Stop Listening' : 'Start Speaking'}
          </Button>
          
          <Button
            onClick={isPlaying ? stopSpeaking : () => {}}
            disabled={!isPlaying}
            variant="outline"
            size="lg"
          >
            {isPlaying ? <VolumeX className="h-5 w-5 mr-2" /> : <Volume2 className="h-5 w-5 mr-2" />}
            {isPlaying ? 'Stop Speaking' : 'AI Speaking'}
          </Button>
        </div>

        {/* Current Status */}
        <div className="text-center">
          {isListening && (
            <p className="text-blue-600 font-medium flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Listening... speak now!
            </p>
          )}
          {isProcessing && (
            <p className="text-orange-600 font-medium flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              Processing your response...
            </p>
          )}
          {isPlaying && (
            <p className="text-green-600 font-medium flex items-center justify-center gap-2">
              <Volume2 className="h-4 w-4" />
              AI is speaking...
            </p>
          )}
          {!isListening && !isPlaying && !isProcessing && conversation.length === 0 && (
            <p className="text-gray-500">Click "Start Speaking" to begin your voice learning session</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
