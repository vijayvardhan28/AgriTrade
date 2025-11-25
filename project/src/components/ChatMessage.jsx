import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';

const ChatMessage = ({ message, isBot }) => {
  return (
    <div className={`flex gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isBot ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
      }`}>
        {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>
      
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
        isBot 
          ? 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none' 
          : 'bg-blue-600 text-white rounded-tr-none'
      }`}>
        {isBot ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{message}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm">{message}</p>
        )}
        <span className="text-[10px] opacity-70 mt-1 block">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
