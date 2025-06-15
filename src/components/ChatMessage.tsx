
import { Bot, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

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

export const ChatMessage = ({ message }: ChatMessageProps) => {
  if (message.isLoading) {
    return <LoadingSkeleton />;
  }

  return (
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
  );
};
