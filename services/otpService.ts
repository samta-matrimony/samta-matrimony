/**
 * OTP Service for Samta Matrimony
 * Implements secure generation, hashing, and verification of One-Time Passwords.
 */

interface OTPStore {
  [key: string]: {
    hash: string;
    expiresAt: number;
    attempts: number;
    lastResentAt: number;
  };
}

// In-memory/LocalStorage store (Simulation of Redis/Database)
const OTP_STORAGE_KEY = 'samta_secure_otp_store';
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60;

// Simple SHA-256 hashing for simulation (In production, use crypto on Node.js)
async function hashOTP(otp: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStore(): OTPStore {
  try {
    const data = localStorage.getItem(OTP_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveStore(store: OTPStore) {
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(store));
}

export const otpService = {
  /**
   * Generates and "sends" a 6-digit OTP
   */
  async requestOTP(identifier: string): Promise<{ success: boolean; message: string; cooldown?: number }> {
    const store = getStore();
    const now = Date.now();

    // Check rate limit
    if (store[identifier] && now - store[identifier].lastResentAt < RESEND_COOLDOWN_SECONDS * 1000) {
      const remaining = Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - (now - store[identifier].lastResentAt)) / 1000);
      return { success: false, message: `Please wait ${remaining}s before resending.`, cooldown: remaining };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = await hashOTP(otp);
    
    store[identifier] = {
      hash,
      expiresAt: now + OTP_EXPIRY_MINUTES * 60 * 1000,
      attempts: 0,
      lastResentAt: now
    };
    
    saveStore(store);

    // MOCK SENDING LOGIC (Integration point for Twilio/SendGrid)
    console.log(`[SECURE_OTP] To: ${identifier} | CODE: ${otp}`);
    
    // Logic for SMS vs Email would branch here
    if (identifier.includes('@')) {
      console.log(`Sending Email via SMTP to ${identifier}...`);
    } else {
      console.log(`Sending SMS via Gateway to ${identifier}...`);
    }

    return { success: true, message: "OTP sent successfully." };
  },

  /**
   * Verifies an OTP provided by the user
   */
  async verifyOTP(identifier: string, otp: string): Promise<{ success: boolean; message: string }> {
    const store = getStore();
    const record = store[identifier];
    const now = Date.now();

    if (!record) {
      return { success: false, message: "No active OTP found. Please request a new one." };
    }

    if (now > record.expiresAt) {
      delete store[identifier];
      saveStore(store);
      return { success: false, message: "OTP has expired. Please request a new one." };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      delete store[identifier];
      saveStore(store);
      return { success: false, message: "Too many failed attempts. Access blocked for safety." };
    }

    const hash = await hashOTP(otp);
    if (hash === record.hash) {
      delete store[identifier]; // One-time use
      saveStore(store);
      return { success: true, message: "Verification successful." };
    } else {
      record.attempts += 1;
      saveStore(store);
      const remaining = MAX_ATTEMPTS - record.attempts;
      return { 
        success: false, 
        message: `Invalid OTP. ${remaining} attempts remaining.` 
      };
    }
  }
};