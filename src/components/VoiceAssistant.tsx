
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, Brain } from 'lucide-react';
import { AssessmentDisplay } from './AssessmentDisplay';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { AssessmentFeedback } from '@/api/voiceAssistant';

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
  const {
    isListening,
    isPlaying,
    assessment,
    conversation,
    isSupported,
    isProcessing,
    startListening,
    stopListening,
    stopSpeaking
  } = useVoiceAssistant(lessonTitle, lessonContent, assessmentMode, onAssessmentUpdate);

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
          <AssessmentDisplay assessment={assessment} />
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
                      <AssessmentDisplay assessment={msg.assessment} />
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
