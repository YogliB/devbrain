import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
	password: string,
	hashedPassword: string,
): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

export function validatePassword(password: string): {
	isValid: boolean;
	message?: string;
} {
	if (password.length < 8) {
		return {
			isValid: false,
			message: 'Password must be at least 8 characters long',
		};
	}

	// Check if password has at least one number
	if (!/\d/.test(password)) {
		return {
			isValid: false,
			message: 'Password must contain at least one number',
		};
	}

	// Check if password has at least one letter
	if (!/[a-zA-Z]/.test(password)) {
		return {
			isValid: false,
			message: 'Password must contain at least one letter',
		};
	}

	return { isValid: true };
}

export function validateEmail(email: string): {
	isValid: boolean;
	message?: string;
} {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return {
			isValid: false,
			message: 'Please enter a valid email address',
		};
	}

	return { isValid: true };
}
