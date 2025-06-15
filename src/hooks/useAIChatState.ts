
import { useState, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

export const useAIChatState = (lessonTitle?: string) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: lessonTitle 
        ? `Hi! I'm your AI learning companion. I can see you're working on "${lessonTitle}". I can help you through text or voice, and I'll assess your understanding as we go. How would you like to learn today?`
        : "Hi! I'm your AI learning companion. I can help you through text or voice. How would you like to learn today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  // Update welcome message when lesson changes
  useEffect(() => {
    if (lessonTitle && messages.length === 1) {
      setMessages([{
        id: 1,
        text: `Hi! I'm your AI learning companion. I can see you're working on "${lessonTitle}". I can help you through text or voice, and I'll assess your understanding as we go. How would you like to learn today?`,
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [lessonTitle]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const addLoadingMessage = () => {
    const loadingMessage: Message = {
      id: messages.length + 2,
      text: "",
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);
  };

  const removeLoadingMessages = () => {
    setMessages(prev => prev.filter(msg => !msg.isLoading));
  };

  const sendMessage = (lessonTitle?: string, lessonContent?: string) => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
    addLoadingMessage();

    // Simulate AI response with loading delay
    setTimeout(() => {
      removeLoadingMessages();
      
      const aiResponse: Message = {
        id: messages.length + 3,
        text: `I understand you're asking about "${inputValue}". Let me help you with that! ${lessonTitle ? `In the context of ${lessonTitle}, ` : ''}this is an important topic that requires understanding of key concepts. Can you tell me what you already know about this?`,
        sender: 'ai',
        timestamp: new Date()
      };
      addMessage(aiResponse);
    }, 2000);

    setInputValue("");
  };

  return {
    messages,
    inputValue,
    setInputValue,
    sendMessage,
    addMessage,
    removeLoadingMessages
  };
};
