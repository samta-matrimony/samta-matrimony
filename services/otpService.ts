/**
 * OTP Service for Samta Matrimony
 * Implements secure generation, hashing, and verification of One-Time Passwords.
 * Uses browser's WebCrypto API for SHA-256 hashing.
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
const OTP_LENGTH = 6;
const MIN_OTP = 100000;
const MAX_OTP = 999999;

// SHA-256 hashing using Web Crypto API (browser-compatible)
async function hashOTP(otp: string): Promise<string> {
  try {
    if (!otp || typeof otp !== 'string') {
      throw new Error('Invalid OTP format');
    }

    const msgBuffer = new TextEncoder().encode(otp);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('Hash OTP error:', err);
    throw new Error('Failed to hash OTP');
  }
}

function getStore(): OTPStore {
  try {
    const data = localStorage.getItem(OTP_STORAGE_KEY);
    if (!data) return {};
    const parsed = JSON.parse(data);
    return typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.error('Failed to read OTP store:', err);
    return {};
  }
}

function saveStore(store: OTPStore): void {
  try {
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to save OTP store:', err);
    // Silently fail - OTP service becomes memory-only fallback
  }
}

// Validate email/phone format
function isValidIdentifier(identifier: string): boolean {
  if (!identifier || typeof identifier !== 'string') return false;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Phone validation (international format)
  const phoneRegex = /^[+]?[0-9\s\-()]{7,15}$/;

  return emailRegex.test(identifier) || phoneRegex.test(identifier);
}

export const otpService = {
  /**
   * Generates and "sends" a 6-digit OTP
   */
  async requestOTP(identifier: string): Promise<{ success: boolean; message: string; cooldown?: number }> {
    try {
      if (!isValidIdentifier(identifier)) {
        return {
          success: false,
          message: 'Invalid email or phone number format.',
        };
      }

      const store = getStore();
      const now = Date.now();

      // Check rate limit
      if (store[identifier]) {
        const timeSinceLastResend = now - store[identifier].lastResentAt;
        if (timeSinceLastResend < RESEND_COOLDOWN_SECONDS * 1000) {
          const remaining = Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - timeSinceLastResend) / 1000);
          return {
            success: false,
            message: `Please wait ${remaining}s before resending.`,
            cooldown: remaining,
          };
        }
      }

      // Generate random 6-digit OTP
      const otp = Math.floor(MIN_OTP + Math.random() * (MAX_OTP - MIN_OTP + 1)).toString().slice(0, OTP_LENGTH);
      const hash = await hashOTP(otp);

      store[identifier] = {
        hash,
        expiresAt: now + OTP_EXPIRY_MINUTES * 60 * 1000,
        attempts: 0,
        lastResentAt: now,
      };

      saveStore(store);

      // MOCK SENDING LOGIC (Integration point for Twilio/SendGrid)
      console.log(`[OTP_GENERATED] Identifier: ${identifier} | OTP: ${otp} | Expires: ${new Date(store[identifier].expiresAt).toISOString()}`);

      // Route based on identifier type
      if (identifier.includes('@')) {
        console.log(`[OTP_EMAIL] Sending to ${identifier}...`);
      } else {
        console.log(`[OTP_SMS] Sending to ${identifier}...`);
      }

      return {
        success: true,
        message: 'OTP sent successfully.',
      };
    } catch (err) {
      console.error('Request OTP error:', err);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again later.',
      };
    }
  },

  /**
   * Verifies an OTP provided by the user
   */
  async verifyOTP(identifier: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!isValidIdentifier(identifier)) {
        return {
          success: false,
          message: 'Invalid email or phone number format.',
        };
      }

      if (!otp || typeof otp !== 'string' || otp.length !== OTP_LENGTH) {
        return {
          success: false,
          message: `OTP must be exactly ${OTP_LENGTH} digits.`,
        };
      }

      const store = getStore();
      const record = store[identifier];
      const now = Date.now();

      // Check if OTP exists
      if (!record) {
        return {
          success: false,
          message: 'No active OTP found. Please request a new one.',
        };
      }

      // Check if OTP expired
      if (now > record.expiresAt) {
        delete store[identifier];
        saveStore(store);
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.',
        };
      }

      // Check if max attempts reached
      if (record.attempts >= MAX_ATTEMPTS) {
        delete store[identifier];
        saveStore(store);
        return {
          success: false,
          message: 'Too many failed attempts. Access blocked for safety. Request new OTP.',
        };
      }

      // Verify OTP hash
      const hash = await hashOTP(otp);
      if (hash === record.hash) {
        delete store[identifier]; // One-time use
        saveStore(store);
        console.log(`[OTP_VERIFIED] Identifier: ${identifier}`);
        return {
          success: true,
          message: 'Verification successful.',
        };
      } else {
        record.attempts += 1;
        saveStore(store);
        const remaining = MAX_ATTEMPTS - record.attempts;
        console.log(`[OTP_FAILED] Identifier: ${identifier} | Attempts: ${record.attempts}/${MAX_ATTEMPTS}`);
        return {
          success: false,
          message: `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        };
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      return {
        success: false,
        message: 'Verification failed. Please try again.',
      };
    }
  },

  /**
   * Clears all stored OTPs (for testing/debugging)
   */
  clearAllOTPs(): void {
    try {
      localStorage.removeItem(OTP_STORAGE_KEY);
      console.log('[OTP_CLEARED] All OTPs cleared');
    } catch (err) {
      console.error('Clear OTPs error:', err);
    }
  },

  /**
   * Gets remaining cooldown time for an identifier
   */
  getResendCooldown(identifier: string): number {
    const store = getStore();
    const record = store[identifier];

    if (!record) return 0;

    const now = Date.now();
    const timeSinceLastResend = now - record.lastResentAt;
    const cooldownMs = RESEND_COOLDOWN_SECONDS * 1000;

    if (timeSinceLastResend >= cooldownMs) return 0;

    return Math.ceil((cooldownMs - timeSinceLastResend) / 1000);
  },
};