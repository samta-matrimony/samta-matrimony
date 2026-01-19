
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { useAuth } from './AuthContext';
import { useInteractions } from './InteractionContext';
import { useAnalytics } from './AnalyticsContext';

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (receiverId: string, text: string) => Promise<void>;
  getConversation: (targetUserId: string) => ChatMessage[];
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { interests } = useInteractions();
  const { track } = useAnalytics();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = useCallback(async (receiverId: string, text: string) => {
    if (!isAuthenticated || !user) {
      throw new Error("Authentication required");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("Message cannot be empty");
    }

    if (!receiverId) {
      throw new Error("Invalid receiver ID");
    }

    // Access Control: Check if interest is accepted
    const interest = interests.find(i => 
      ((i.senderId === user.uid && i.receiverId === receiverId) ||
       (i.senderId === receiverId && i.receiverId === user.uid)) &&
      i.status === 'accepted'
    );

    if (!interest) {
      throw new Error("Chat is only available after interest is accepted");
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.uid,
      receiverId: receiverId,
      conversationId: interest.id,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMessage]);
    track('message_sent', { receiverId, wordCount: text.split(' ').length });
  }, [user, isAuthenticated, interests, track]);

  const getConversation = useCallback((targetUserId: string) => {
    if (!user) return [];
    return messages.filter(m => 
      (m.senderId === user.uid && m.receiverId === targetUserId) ||
      (m.senderId === targetUserId && m.receiverId === user.uid)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [user, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider value={{ 
      messages, 
      sendMessage, 
      getConversation,
      clearMessages
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
