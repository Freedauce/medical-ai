/**
 * Authentication Unit Tests
 * Tests for authentication functionality
 */

import bcrypt from 'bcryptjs';

describe('Authentication - Password Hashing', () => {
    const testPassword = 'testPassword123';

    test('should hash password correctly', async () => {
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        expect(hashedPassword).not.toBe(testPassword);
        expect(hashedPassword.length).toBeGreaterThan(0);
    });

    test('should verify correct password', async () => {
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const isValid = await bcrypt.compare(testPassword, hashedPassword);
        expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const isValid = await bcrypt.compare('wrongPassword', hashedPassword);
        expect(isValid).toBe(false);
    });
});

describe('Authentication - Email Validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    test('should validate correct email format', () => {
        expect(emailRegex.test('test@example.com')).toBe(true);
        expect(emailRegex.test('user.name@domain.org')).toBe(true);
        expect(emailRegex.test('user+tag@domain.co.uk')).toBe(true);
    });

    test('should reject invalid email format', () => {
        expect(emailRegex.test('invalid-email')).toBe(false);
        expect(emailRegex.test('@domain.com')).toBe(false);
        expect(emailRegex.test('user@')).toBe(false);
        expect(emailRegex.test('')).toBe(false);
    });
});

describe('Authentication - Password Requirements', () => {
    const validatePassword = (password: string): { valid: boolean; error?: string } => {
        if (!password) {
            return { valid: false, error: 'Password is required' };
        }
        if (password.length < 8) {
            return { valid: false, error: 'Password must be at least 8 characters' };
        }
        return { valid: true };
    };

    test('should accept valid password', () => {
        const result = validatePassword('password123');
        expect(result.valid).toBe(true);
    });

    test('should reject empty password', () => {
        const result = validatePassword('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Password is required');
    });

    test('should reject short password', () => {
        const result = validatePassword('short');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Password must be at least 8 characters');
    });

    test('should accept password with exactly 8 characters', () => {
        const result = validatePassword('12345678');
        expect(result.valid).toBe(true);
    });
});

describe('Authentication - Registration Validation', () => {
    interface RegistrationData {
        name: string;
        email: string;
        password: string;
    }

    const validateRegistration = (data: RegistrationData): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            errors.push('Invalid email format');
        }

        if (!data.password || data.password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }

        return { valid: errors.length === 0, errors };
    };

    test('should accept valid registration data', () => {
        const result = validateRegistration({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123'
        });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('should reject registration with invalid name', () => {
        const result = validateRegistration({
            name: 'J',
            email: 'john@example.com',
            password: 'password123'
        });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Name must be at least 2 characters');
    });

    test('should reject registration with invalid email', () => {
        const result = validateRegistration({
            name: 'John Doe',
            email: 'invalid-email',
            password: 'password123'
        });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Invalid email format');
    });

    test('should collect all validation errors', () => {
        const result = validateRegistration({
            name: '',
            email: 'invalid',
            password: 'short'
        });
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
    });
});
