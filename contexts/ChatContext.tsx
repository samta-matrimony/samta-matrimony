
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { useAuth } from './AuthContext';
import { useInteractions } from './InteractionContext';
import { useAnalytics } from './AnalyticsContext';

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (receiverId: string, text: string) => Promise<void>;
  getConversation: (targetUserId: string) => ChatMessage[];
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { interests } = useInteractions();
  const { track } = useAnalytics();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('samta_chat_messages');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const saveMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    localStorage.setItem('samta_chat_messages', JSON.stringify(newMessages));
  };

  const sendMessage = async (receiverId: string, text: string) => {
    if (!isAuthenticated || !user) throw new Error("Authentication required");

    // Access Control: Check if interest is accepted
    const interest = interests.find(i => 
      ((i.senderId === user.id && i.receiverId === receiverId) ||
       (i.senderId === receiverId && i.receiverId === user.id)) &&
      i.status === 'accepted'
    );

    if (!interest) {
      throw new Error("Chat is only available after interest is accepted.");
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id as string,
      receiverId: receiverId,
      conversationId: interest.id,
      text: text,
      timestamp: new Date().toISOString()
    };

    saveMessages([...messages, newMessage]);
    track('message_sent', { receiverId, wordCount: text.split(' ').length });
  };

  const getConversation = (targetUserId: string) => {
    if (!user) return [];
    return messages.filter(m => 
      (m.senderId === user.id && m.receiverId === targetUserId) ||
      (m.senderId === targetUserId && m.receiverId === user.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      sendMessage, 
      getConversation,
      isLoading 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
