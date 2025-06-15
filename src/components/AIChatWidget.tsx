
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, User, X, Send, Mic } from "lucide-react";
import { VoiceAssistant } from "./VoiceAssistant";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your AI learning companion. I can help you through text or voice. How would you like to learn today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Add loading message
    const loadingMessage: Message = {
      id: messages.length + 2,
      text: "",
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    // Simulate AI response with loading delay
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      const aiResponse: Message = {
        id: messages.length + 3,
        text: "I understand you're asking about " + inputValue + ". Let me help you with that! In a real implementation, I would provide detailed explanations and adaptive learning support.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 2000);

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const LoadingSkeleton = () => (
    <div className="flex justify-start">
      <div className="flex items-start space-x-2 max-w-[80%]">
        <div className="p-2 rounded-full bg-gray-200">
          <Bot className="h-4 w-4 text-gray-600" />
        </div>
        <div className="p-3 rounded-2xl bg-gray-100">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );

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
                  <p className="text-blue-100 text-sm">Online • Ready to help</p>
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
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[500px]">
            {showVoiceMode ? (
              <div className="p-4 flex-1 flex items-center justify-center">
                <VoiceAssistant assessmentMode={true} />
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id}>
                        {message.isLoading ? (
                          <LoadingSkeleton />
                        ) : (
                          <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-start space-x-2 max-w-[80%] ${
                              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                            }`}>
                              <div className={`p-2 rounded-full ${
                                message.sender === 'user' 
                                  ? 'bg-bikal-blue' 
                                  : 'bg-gray-200'
                              }`}>
                                {message.sender === 'user' ? (
                                  <User className="h-4 w-4 text-white" />
                                ) : (
                                  <Bot className="h-4 w-4 text-gray-600" />
                                )}
                              </div>
                              <div className={`p-3 rounded-2xl ${
                                message.sender === 'user'
                                  ? 'bg-bikal-blue text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{message.text}</p>
                                <p className={`text-xs mt-1 ${
                                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {message.timestamp.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your studies..."
                      className="flex-1 rounded-xl"
                    />
                    <Button
                      onClick={sendMessage}
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
