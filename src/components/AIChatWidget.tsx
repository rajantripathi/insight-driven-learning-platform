
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, X, Send, Mic, Brain } from "lucide-react";
import { VoiceAssistant } from "./VoiceAssistant";
import { ChatMessage } from "./ChatMessage";
import { AssessmentDisplay } from "./AssessmentDisplay";
import { useAIChatState } from "@/hooks/useAIChatState";
import { AssessmentFeedback } from "@/api/voiceAssistant";

interface AIChatWidgetProps {
  lessonTitle?: string;
  lessonContent?: string;
}

export const AIChatWidget = ({ lessonTitle, lessonContent }: AIChatWidgetProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [overallAssessment, setOverallAssessment] = useState<AssessmentFeedback | null>(null);
  
  const { messages, inputValue, setInputValue, sendMessage } = useAIChatState(lessonTitle);

  const handleAssessmentUpdate = (assessment: AssessmentFeedback) => {
    console.log('Assessment update received:', assessment);
    setOverallAssessment(assessment);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage(lessonTitle, lessonContent);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-bikal-blue to-blue-700 hover:opacity-90 shadow-2xl z-50"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl border-0 rounded-2xl z-50 bg-white">
          <CardHeader className="bg-gradient-to-r from-bikal-blue to-blue-700 text-white rounded-t-2xl pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Learning Assistant</CardTitle>
                  <p className="text-blue-100 text-sm">
                    {lessonTitle ? `Learning: ${lessonTitle}` : 'Online • Ready to help'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Mode Selection */}
            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVoiceMode(false)}
                className={`text-white hover:bg-white/20 ${!showVoiceMode ? 'bg-white/20' : ''}`}
              >
                Text Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVoiceMode(true)}
                className={`text-white hover:bg-white/20 ${showVoiceMode ? 'bg-white/20' : ''}`}
              >
                <Mic className="h-4 w-4 mr-1" />
                Voice Mode
              </Button>
            </div>

            {/* Assessment Status */}
            {overallAssessment && showVoiceMode && (
              <AssessmentDisplay assessment={overallAssessment} showVoiceMode={showVoiceMode} />
            )}
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[500px]">
            {showVoiceMode ? (
              <div className="p-4 flex-1 flex items-center justify-center">
                <VoiceAssistant 
                  lessonTitle={lessonTitle}
                  lessonContent={lessonContent}
                  assessmentMode={true}
                  onAssessmentUpdate={handleAssessmentUpdate}
                />
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={lessonTitle ? `Ask about ${lessonTitle}...` : "Ask me anything about your studies..."}
                      className="flex-1 rounded-xl"
                    />
                    <Button
                      onClick={() => sendMessage(lessonTitle, lessonContent)}
                      size="sm"
                      className="bg-bikal-blue hover:bg-bikal-blue/90 rounded-xl px-3"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};
