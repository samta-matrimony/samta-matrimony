import React from 'react';
import { 
  Users, 
  Heart, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  Languages, 
  ShieldCheck 
} from 'lucide-react';
import { BrowseCategory } from './types';

export const BROWSE_CATEGORIES: BrowseCategory[] = [
  { id: 'tongue', label: 'Mother Tongue', param: 'motherTongue', items: ['Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam', 'Punjabi'] },
  { id: 'religion', label: 'Religion', param: 'religion', items: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi'] },
  { id: 'caste', label: 'Caste/Community', param: 'caste', items: ['Brahmin', 'Kshatriya', 'Vaishya', 'Maratha', 'Patel', 'Jat', 'Yadav', 'Reddy', 'Nair'] },
  { id: 'city', label: 'City', param: 'city', items: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'] },
  { id: 'state', label: 'State', param: 'state', items: ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Punjab', 'Tamil Nadu', 'Gujarat', 'West Bengal'] },
  { id: 'occupation', label: 'Occupation', param: 'occupation', items: ['Software Engineer', 'Doctor', 'Manager', 'Business Owner', 'Teacher', 'Architect', 'Chartered Accountant'] },
  { id: 'nri', label: 'NRI Status', param: 'nriStatus', items: ['Resident', 'NRI', 'Green Card Holder', 'Citizen'] }
];

export const APP_THEME = {
  primary: '#800000', // Maroon
  secondary: '#FFD700', // Gold
  accent: '#E63946',
  background: '#F8F9FA'
};