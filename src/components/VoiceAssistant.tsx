
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendVoiceMessage, AssessmentFeedback } from '@/api/voiceAssistant';

interface VoiceAssistantProps {
  lessonTitle?: string;
  lessonContent?: string;
  assessmentMode?: boolean;
}

export const VoiceAssistant = ({ lessonTitle, lessonContent, assessmentMode = false }: VoiceAssistantProps) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [assessment, setAssessment] = useState<AssessmentFeedback | null>(null);
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', text: string}>>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = async (event) => {
          const speechResult = event.results[0][0].transcript;
          setTranscript(speechResult);
          setConversation(prev => [...prev, { type: 'user', text: speechResult }]);
          
          try {
            const response = await sendVoiceMessage({
              message: speechResult,
              context: lessonTitle,
              lessonContent,
              assessmentMode,
            });
            
            setAiResponse(response.response);
            setConversation(prev => [...prev, { type: 'ai', text: response.response }]);
            
            if (response.assessment) {
              setAssessment(response.assessment);
            }
            
            // Speak the AI response
            speakText(response.response);
            
          } catch (error: any) {
            console.error('Error getting AI response:', error);
            toast({
              title: "Error",
              description: `Failed to get AI response: ${error.message}`,
              variant: "destructive",
            });
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Speech Recognition Error",
            description: "Please try again or check your microphone permissions.",
            variant: "destructive",
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [lessonTitle, lessonContent, assessmentMode, toast]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
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
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          AI Voice Learning Assistant
          {assessmentMode && <Badge variant="secondary">Assessment Mode</Badge>}
        </CardTitle>
        <CardDescription>
          {lessonTitle ? `Learning: ${lessonTitle}` : 'Ask me anything about your studies!'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conversation History */}
        <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg">
          {conversation.length === 0 ? (
            <p className="text-gray-500 text-center">Start speaking to begin your learning session!</p>
          ) : (
            conversation.map((msg, index) => (
              <div key={index} className={`p-2 rounded ${
                msg.type === 'user' ? 'bg-blue-100 ml-4' : 'bg-green-100 mr-4'
              }`}>
                <span className="font-semibold">{msg.type === 'user' ? 'You: ' : 'AI: '}</span>
                {msg.text}
              </div>
            ))
          )}
        </div>

        {/* Assessment Feedback */}
        {assessment && assessmentMode && (
          <Card className="bg-blue-50">
            <CardContent className="p-3">
              <h4 className="font-semibold mb-2">Learning Assessment</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant={assessment.understoodConcept ? "default" : "secondary"}>
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

        {/* Voice Controls */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            size="lg"
          >
            {isListening ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
            {isListening ? 'Stop Listening' : 'Start Speaking'}
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
            <p className="text-blue-600 font-medium">🎤 Listening... speak now!</p>
          )}
          {isPlaying && (
            <p className="text-green-600 font-medium">🔊 AI is speaking...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
