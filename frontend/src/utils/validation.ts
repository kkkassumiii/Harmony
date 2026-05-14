/**
 * Validation utilities for frontend forms
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validators = {
  // Email validation
  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email обязателен';
    if (!emailRegex.test(value)) return 'Некорректный формат email';
    if (value.length > 255) return 'Email слишком длинный (макс. 255 символов)';
    return null;
  },

  // Password validation
  password: (value: string): string | null => {
    if (!value) return 'Пароль обязателен';
    if (value.length < 6) return 'Пароль должен содержать минимум 6 символов';
    if (value.length > 128) return 'Пароль слишком длинный (макс. 128 символов)';
    return null;
  },

  // Username validation
  username: (value: string): string | null => {
    if (!value) return 'Имя пользователя обязательно';
    if (value.length < 3) return 'Имя пользователя должно содержать минимум 3 символа';
    if (value.length > 50) return 'Имя пользователя слишком длинное (макс. 50 символов)';
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Имя пользователя может содержать только буквы, цифры, - и _';
    return null;
  },

  // First name validation
  firstName: (value: string): string | null => {
    if (!value) return 'Имя обязательно';
    if (value.length < 2) return 'Имя должно содержать минимум 2 символа';
    if (value.length > 50) return 'Имя слишком длинное (макс. 50 символов)';
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value)) return 'Имя может содержать только буквы, пробелы и дефисы';
    return null;
  },

  // Last name validation
  lastName: (value: string): string | null => {
    if (value && value.length < 2) return 'Фамилия должна содержать минимум 2 символа';
    if (value && value.length > 50) return 'Фамилия слишком длинная (макс. 50 символов)';
    if (value && !/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value)) return 'Фамилия может содержать только буквы, пробелы и дефисы';
    return null;
  },

  // Title validation (for goals, habits, etc.)
  title: (value: string): string | null => {
    if (!value) return 'Название обязательно';
    if (value.length < 3) return 'Название должно содержать минимум 3 символа';
    if (value.length > 200) return 'Название слишком длинное (макс. 200 символов)';
    return null;
  },

  // Description validation
  description: (value: string): string | null => {
    if (value && value.length > 1000) return 'Описание слишком длинное (макс. 1000 символов)';
    return null;
  },

  // Content validation (for emotion entries)
  content: (value: string): string | null => {
    if (!value) return 'Содержание обязательно';
    if (value.length < 5) return 'Содержание должно содержать минимум 5 символов';
    if (value.length > 5000) return 'Содержание слишком длинное (макс. 5000 символов)';
    return null;
  },

  // Mood level validation
  moodLevel: (value: number): string | null => {
    if (value === null || value === undefined) return 'Уровень настроения обязателен';
    if (value < 1 || value > 10) return 'Уровень настроения должен быть от 1 до 10';
    return null;
  },

  // Date validation
  date: (value: string): string | null => {
    if (!value) return 'Дата обязательна';
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Некорректный формат даты';
    return null;
  },

  // Date range validation (startDate <= endDate)
  dateRange: (startDate: string, endDate: string): string | null => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (start > end) return 'Дата начала должна быть раньше даты окончания';
    return null;
  },

  // Color validation
  color: (value: string): string | null => {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!value) return 'Цвет обязателен';
    if (!colorRegex.test(value)) return 'Некорректный формат цвета (используйте #RRGGBB)';
    return null;
  },

  // Phone number validation
  phone: (value: string): string | null => {
    if (!value) return 'Номер телефона обязателен';
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length < 10) return 'Номер телефона должен содержать минимум 10 цифр';
    if (cleanPhone.length > 15) return 'Номер телефона слишком длинный';
    // International format validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test('+' + cleanPhone)) return 'Некорректный формат номера телефона';
    return null;
  },
};

// Generic validation function
export const validate = (
  data: Record<string, any>,
  schema: Record<string, (value: any) => string | null>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(schema).forEach((key) => {
    const error = schema[key](data[key]);
    if (error) {
      errors[key] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 10000); // Max length protection
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, timeWindowMs: number) => {
  const requests: number[] = [];

  return {
    isAllowed: (): boolean => {
      const now = Date.now();
      // Remove old requests outside time window
      while (requests.length > 0 && requests[0] < now - timeWindowMs) {
        requests.shift();
      }

      if (requests.length < maxRequests) {
        requests.push(now);
        return true;
      }
      return false;
    },
  };
};
