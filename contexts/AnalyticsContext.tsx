
import React, { createContext, useContext, useCallback } from 'react';
import { trackEvent } from '../services/analyticsService';
import { useAuth } from './AuthContext';

interface AnalyticsContextType {
  track: (eventName: string, properties?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const track = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    if (!eventName) return;
    const userId = user?.uid || 'anonymous';
    try {
      trackEvent(userId, eventName, properties);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [user?.uid]);

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
