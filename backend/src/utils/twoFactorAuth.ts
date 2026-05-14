/**
 * Two-Factor Authentication utilities
 */

import { prisma } from '../index';
import crypto from 'crypto';

// Generate random 6-digit code
export const generateVerificationCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send verification code via email (mock implementation)
export const sendVerificationCodeByEmail = async (
  email: string,
  code: string
): Promise<boolean> => {
  try {
    console.log(`[2FA] Sending code ${code} to ${email}`);
    
    // In production, integrate with email service (Sendgrid, AWS SES, etc.)
    // For now, just log it
    // TODO: Implement actual email sending
    
    return true;
  } catch (error) {
    console.error('Error sending verification code:', error);
    return false;
  }
};

// Send verification code via SMS (mock implementation)
export const sendVerificationCodeBySMS = async (
  phone: string,
  code: string
): Promise<boolean> => {
  try {
    console.log(`[2FA] Sending SMS code ${code} to ${phone}`);
    
    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    // For now, just log it
    // TODO: Implement actual SMS sending
    
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

// Create and send 2FA code
export const createAndSendVerificationCode = async (
  userId: string,
  method: 'email' | 'sms',
  destination: string
): Promise<boolean> => {
  try {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code to database
    await prisma.twoFactorCode.create({
      data: {
        userId,
        method,
        code,
        destination,
        expiresAt,
      },
    });

    // Send code
    if (method === 'email') {
      return await sendVerificationCodeByEmail(destination, code);
    } else if (method === 'sms') {
      return await sendVerificationCodeBySMS(destination, code);
    }

    return false;
  } catch (error) {
    console.error('Error creating verification code:', error);
    return false;
  }
};

// Verify code
export const verifyCode = async (
  userId: string,
  code: string
): Promise<{ isValid: boolean; method?: 'email' | 'sms'; destination?: string; error?: string }> => {
  try {
    const codeRecord = await prisma.twoFactorCode.findFirst({
      where: {
        userId,
        code,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!codeRecord) {
      return {
        isValid: false,
        error: 'Invalid or expired code',
      };
    }

    // Check attempts
    if (codeRecord.attempts >= codeRecord.maxAttempts) {
      // Mark as expired
      await prisma.twoFactorCode.update({
        where: { id: codeRecord.id },
        data: { isUsed: true },
      });

      return {
        isValid: false,
        error: 'Too many attempts. Code expired.',
      };
    }

    // Mark as used
    await prisma.twoFactorCode.update({
      where: { id: codeRecord.id },
      data: { isUsed: true },
    });

    return { isValid: true, method: codeRecord.method as 'email' | 'sms', destination: codeRecord.destination };
  } catch (error) {
    console.error('Error verifying code:', error);
    return {
      isValid: false,
      error: 'Error verifying code',
    };
  }
};

// Increment attempts
export const incrementCodeAttempts = async (userId: string, code: string): Promise<void> => {
  try {
    const codeRecord = await prisma.twoFactorCode.findFirst({
      where: {
        userId,
        code,
        isUsed: false,
      },
    });

    if (codeRecord) {
      await prisma.twoFactorCode.update({
        where: { id: codeRecord.id },
        data: { attempts: codeRecord.attempts + 1 },
      });
    }
  } catch (error) {
    console.error('Error incrementing attempts:', error);
  }
};

// Clean up expired codes
export const cleanupExpiredCodes = async (): Promise<number> => {
  try {
    const result = await prisma.twoFactorCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired codes:', error);
    return 0;
  }
};

// Validate phone number format
export const validatePhoneNumber = (phone: string): boolean => {
  // Simple validation - accepts +1234567890 format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Format phone number for storage
export const formatPhoneNumber = (phone: string): string => {
  return '+' + phone.replace(/\D/g, '');
};

// Mask phone number for display
export const maskPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;
  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
};

// Mask email for display
export const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  if (name.length <= 2) {
    return name + '***@' + domain;
  }
  return name.slice(0, 2) + '*'.repeat(name.length - 2) + '@' + domain;
};
