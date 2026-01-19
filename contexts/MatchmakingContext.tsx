
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MatchScore, AppNotification, UserProfile } from '../types';
import { useAuth } from './AuthContext';
import { MOCK_PROFILES } from '../services/mockData';
import { getAIBasedRecommendations } from '../services/geminiService';

interface MatchmakingContextType {
  recommendations: MatchScore[];
  notifications: AppNotification[];
  isLoading: boolean;
  refreshRecommendations: () => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
}

const MatchmakingContext = createContext<MatchmakingContextType | undefined>(undefined);

export const MatchmakingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<MatchScore[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshRecommendations = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);
    
    // Exclude demo profiles from candidates list for AI recommendations
    const candidates = MOCK_PROFILES.filter(p => !p.isDemo && p.id !== user.id && p.gender !== user.gender);
    
    if (candidates.length === 0) {
      setRecommendations([]);
    } else {
      const aiScores = await getAIBasedRecommendations(user as UserProfile, candidates);
      setRecommendations(aiScores.slice(0, 10));
    }
    
    setIsLoading(false);
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshRecommendations();
      
      setNotifications([
        {
          id: 'n1',
          type: 'system',
          title: 'Welcome to Samta',
          message: 'Complete your profile to get 2x more matches!',
          timestamp: new Date().toISOString(),
          isRead: false
        }
      ]);
    }
  }, [isAuthenticated, user?.id]);

  const addNotification = (n: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newN: AppNotification = {
      ...n,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newN, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <MatchmakingContext.Provider value={{ 
      recommendations, 
      notifications, 
      isLoading, 
      refreshRecommendations, 
      markNotificationAsRead,
      addNotification
    }}>
      {children}
    </MatchmakingContext.Provider>
  );
};

export const useMatchmaking = () => {
  const context = useContext(MatchmakingContext);
  if (context === undefined) {
    throw new Error('useMatchmaking must be used within a MatchmakingProvider');
  }
  return context;
};
