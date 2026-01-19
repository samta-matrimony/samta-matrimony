import React, { createContext, useContext, useState, useEffect } from 'react';
import { Interest, InterestStatus } from '../types';
import { useAuth } from './AuthContext';
import { useAnalytics } from './AnalyticsContext';

interface InteractionContextType {
  interests: Interest[];
  sendInterest: (targetUserId: string) => Promise<void>;
  updateInterestStatus: (interestId: string, status: InterestStatus) => Promise<void>;
  getInterestWithUser: (targetUserId: string) => Interest | undefined;
  isLoading: boolean;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

export const InteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { track } = useAnalytics();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('samta_interests');
    if (saved) {
      setInterests(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const saveInterests = (newInterests: Interest[]) => {
    setInterests(newInterests);
    localStorage.setItem('samta_interests', JSON.stringify(newInterests));
  };

  const sendInterest = async (targetUserId: string) => {
    if (!isAuthenticated || !user) throw new Error("Please login to send interest");
    
    // Check for duplicates
    const exists = interests.find(i => 
      (i.senderId === user.id && i.receiverId === targetUserId) ||
      (i.senderId === targetUserId && i.receiverId === user.id)
    );

    if (exists) {
      throw new Error("Interest already exists between these users");
    }

    const newInterest: Interest = {
      id: `int-${Date.now()}`,
      senderId: user.id as string,
      receiverId: targetUserId,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    const newInterests = [...interests, newInterest];
    saveInterests(newInterests);
    track('interest_sent', { targetId: targetUserId });
    
    const sentCount = newInterests.filter(i => i.senderId === user.id).length;
    if (user.subscription) {
       updateUser({
         subscription: {
           ...user.subscription,
           interestsSentCount: sentCount
         }
       });
    }
  };

  const updateInterestStatus = async (interestId: string, status: InterestStatus) => {
    const newInterests = interests.map(i => 
      i.id === interestId ? { ...i, status } : i
    );
    saveInterests(newInterests);
    track('interest_status_update', { interestId, status });
  };

  const getInterestWithUser = (targetUserId: string) => {
    if (!user) return undefined;
    return interests.find(i => 
      (i.senderId === user.id && i.receiverId === targetUserId) ||
      (i.senderId === targetUserId && i.receiverId === user.id)
    );
  };

  return (
    <InteractionContext.Provider value={{ 
      interests, 
      sendInterest, 
      updateInterestStatus, 
      getInterestWithUser,
      isLoading 
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