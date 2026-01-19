
export type Gender = 'Male' | 'Female' | 'Other';
export type MaritalStatus = 'Never Married' | 'Divorced' | 'Widowed' | 'Awaiting Divorce';
export type Religion = 'Hindu' | 'Muslim' | 'Christian' | 'Sikh' | 'Buddhist' | 'Jain' | 'Parsi' | 'Jewish' | 'Other';
export type MotherTongue = 'Hindi' | 'Bengali' | 'Marathi' | 'Telugu' | 'Tamil' | 'Gujarati' | 'Urdu' | 'Kannada' | 'Odia' | 'Malayalam' | 'Punjabi' | 'Assamese' | 'English';
export type NRIStatus = 'Resident' | 'NRI' | 'Green Card Holder' | 'Citizen';

export type InterestStatus = 'pending' | 'accepted' | 'rejected';
export type PlanType = 'Free' | 'Silver' | 'Gold' | 'Platinum';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'admin';

export interface Subscription {
  plan: PlanType;
  expiryDate: string | null;
  interestsSentCount: number;
}

export interface Interest {
  id: string;
  senderId: string;
  receiverId: string;
  status: InterestStatus;
  timestamp: string;
}

export interface PartnerPreferences {
  ageRange: string;
  heightRange: string;
  maritalStatus: string;
  religion: string;
  motherTongue: string;
  education: string;
  occupation: string;
  location: string;
}

export interface UserProfile {
  id: string;
  uid?: string; // Firebase UID, for backward compatibility
  name: string;
  email: string;
  mobileNumber: string;
  gender: Gender;
  age: number;
  height: string;
  dateOfBirth: string;
  maritalStatus: MaritalStatus;
  motherTongue: MotherTongue;
  religion: Religion;
  caste: string;
  subCaste?: string;
  city: string;
  district: string;
  state: string;
  country: string;
  education: string;
  college: string;
  occupation: string;
  industry: string;
  income: string;
  nriStatus: NRIStatus;
  lifestyle: string[];
  familyBackground: string;
  familyValues: 'Traditional' | 'Moderate' | 'Liberal';
  familyType: 'Joint' | 'Nuclear';
  familyStatus: 'Middle Class' | 'Upper Middle Class' | 'Rich' | 'Affluent';
  bio: string;
  photoUrl: string;
  additionalPhotos?: string[];
  isVerified: boolean;
  isPremium: boolean;
  isDemo?: boolean; // New property for UI preview profiles
  lastActive: string;
  joinedDate: string;
  partnerPreferences?: PartnerPreferences;
  subscription?: Subscription;
  // Admin & Security Fields
  role: UserRole;
  status: UserStatus;
  moderationStatus: ModerationStatus;
  // Behavioral tracking
  viewedProfileIds?: string[];
  searchActivity?: string[];
  // Consent Tracking
  declarationAccepted: boolean;
  declarationTimestamp: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  timestamp: string;
  details: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

export interface AnalyticsEvent {
  id: string;
  userId: string | 'anonymous';
  eventName: string;
  properties: Record<string, any>;
  timestamp: string;
  sessionId: string;
}

export interface ConversionFunnel {
  visitors: number;
  registrations: number;
  engagement: number; // sent at least 1 interest
  paidUsers: number;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  paidUsers: number;
  totalInterests: number;
  totalMessages: number;
  revenue: number;
  dailyActiveUsers: number[];
  funnel: ConversionFunnel;
}

export interface MatchScore {
  profileId: string;
  score: number; // 0-100
  reason?: string;
}

export interface AppNotification {
  id: string;
  type: 'interest' | 'acceptance' | 'expiry' | 'new_match' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface BrowseCategory {
  id: string;
  label: string;
  items: string[];
  param: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  text: string;
  timestamp: string;
}
