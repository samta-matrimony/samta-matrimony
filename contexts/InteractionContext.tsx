import React, { createContext, useContext, useState, useCallback } from 'react';
import { Interest, InterestStatus } from '../types';
import { useAuth } from './AuthContext';
import { useAnalytics } from './AnalyticsContext';

interface InteractionContextType {
  interests: Interest[];
  sendInterest: (targetUserId: string) => Promise<void>;
  updateInterestStatus: (interestId: string, status: InterestStatus) => Promise<void>;
  getInterestWithUser: (targetUserId: string) => Interest | undefined;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

export const InteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { track } = useAnalytics();
  const [interests, setInterests] = useState<Interest[]>([]);

  const sendInterest = useCallback(async (targetUserId: string) => {
    if (!isAuthenticated || !user) {
      throw new Error("Please login to send interest");
    }

    if (!targetUserId) {
      throw new Error("Invalid target user ID");
    }

    if (targetUserId === user.uid) {
      throw new Error("Cannot send interest to yourself");
    }

    // Check for duplicates
    const exists = interests.find(i => 
      (i.senderId === user.uid && i.receiverId === targetUserId) ||
      (i.senderId === targetUserId && i.receiverId === user.uid)
    );

    if (exists) {
      throw new Error("Interest already exists between these users");
    }

    const newInterest: Interest = {
      id: `int-${Date.now()}`,
      senderId: user.uid,
      receiverId: targetUserId,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    setInterests((prev) => [...prev, newInterest]);
    track('interest_sent', { targetId: targetUserId });
  }, [user, isAuthenticated, interests, track]);

  const updateInterestStatus = useCallback(async (interestId: string, status: InterestStatus) => {
    if (!interestId || !status) {
      throw new Error("Invalid interest ID or status");
    }

    setInterests((prev) =>
      prev.map(i => 
        i.id === interestId ? { ...i, status } : i
      )
    );
    track('interest_status_update', { interestId, status });
  }, [track]);

  const getInterestWithUser = useCallback((targetUserId: string) => {
    if (!user || !targetUserId) return undefined;
    return interests.find(i => 
      (i.senderId === user.uid && i.receiverId === targetUserId) ||
      (i.senderId === targetUserId && i.receiverId === user.uid)
    );
  }, [user, interests]);

  return (
    <InteractionContext.Provider value={{ 
      interests, 
      sendInterest, 
      updateInterestStatus, 
      getInterestWithUser
    }}>
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteractions = () => {
  const context = useContext(InteractionContext);
  if (context === undefined) {
    throw new Error('useInteractions must be used within an InteractionProvider');
  }
  return context;
};