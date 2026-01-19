
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
    const userId = user?.id || 'anonymous';
    trackEvent(userId, eventName, properties);
  }, [user?.id]);

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
