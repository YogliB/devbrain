import { describe, it, expect } from 'vitest';
import {
	hashPassword,
	verifyPassword,
	validatePassword,
	validateEmail,
} from './auth-utils';

describe('auth-utils', () => {
	describe('validatePassword', () => {
		it('should validate a strong password', () => {
			const result = validatePassword('password123');
			expect(result.isValid).toBe(true);
		});

		it('should reject a password that is too short', () => {
			const result = validatePassword('pass1');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('at least 8 characters');
		});

		it('should reject a password without numbers', () => {
			const result = validatePassword('passwordonly');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('at least one number');
		});

		it('should reject a password without letters', () => {
			const result = validatePassword('12345678');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('at least one letter');
		});
	});

	describe('validateEmail', () => {
		it('should validate a correct email', () => {
			const result = validateEmail('test@example.com');
			expect(result.isValid).toBe(true);
		});

		it('should reject an invalid email', () => {
			const result = validateEmail('not-an-email');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('valid email');
		});
	});

	describe('password hashing', () => {
		it('should hash and verify a password', async () => {
			const password = 'testPassword123';
			const hashedPassword = await hashPassword(password);

			// Hashed password should be different from original
			expect(hashedPassword).not.toBe(password);

			// Verification should work
			const isValid = await verifyPassword(password, hashedPassword);
			expect(isValid).toBe(true);

			// Wrong password should fail verification
			const isInvalid = await verifyPassword(
				'wrongPassword',
				hashedPassword,
			);
			expect(isInvalid).toBe(false);
		});
	});
});
