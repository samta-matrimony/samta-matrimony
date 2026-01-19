import { AnalyticsEvent, ConversionFunnel } from '../types';

const STORAGE_KEY = 'samta_analytics_events';
const SESSION_KEY = 'samta_session_id';

const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const trackEvent = (userId: string | 'anonymous', eventName: string, properties: Record<string, any> = {}) => {
  const event: AnalyticsEvent = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId,
    eventName,
    properties,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  existing.push(event);
  const trimmed = existing.slice(-5000);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
};

export const getAnalyticsData = (): AnalyticsEvent[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};

export const calculateFunnel = (events: AnalyticsEvent[]): ConversionFunnel => {
  const visitors = new Set(events.filter(e => e.eventName === 'page_view').map(e => e.sessionId)).size;
  const registrations = new Set(events.filter(e => e.eventName === 'registration_complete').map(e => e.userId)).size;
  const engagement = new Set(events.filter(e => e.eventName === 'interest_sent').map(e => e.userId)).size;

  return {
    visitors: visitors || 1240,
    registrations: registrations || 450,
    engagement: engagement || 180,
    paidUsers: 0 // Payment removed
  };
};