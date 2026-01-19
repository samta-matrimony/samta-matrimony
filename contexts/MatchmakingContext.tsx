
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
  const [initialized, setInitialized] = useState(false);

  const refreshRecommendations = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setIsLoading(true);
      
      // Exclude demo profiles and same user from candidates list
      const candidates = MOCK_PROFILES.filter(
        (p) => !p.isDemo && p.id !== user.uid && p.gender !== user.gender
      );
      
      if (candidates.length === 0) {
        setRecommendations([]);
      } else {
        const aiScores = await getAIBasedRecommendations(user as UserProfile, candidates);
        setRecommendations(aiScores.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !initialized) {
      setInitialized(true);
      refreshRecommendations();
      
      // Set welcome notification only once
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
  }, [isAuthenticated, initialized, refreshRecommendations]);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    if (!n.type || !n.title) {
      console.warn('Invalid notification data');
      return;
    }
    
    const newN: AppNotification = {
      ...n,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications((prev) => [newN, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    if (!id) {
      console.warn('Invalid notification ID');
      return;
    }
    
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  return (
    <MatchmakingContext.Provider
      value={{
        recommendations,
        notifications,
        isLoading,
        refreshRecommendations,
        markNotificationAsRead,
        addNotification
      }}
    >
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
