import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { withDb } from '@/middleware/db-middleware';
import {
	hashPassword,
	validateEmail,
	validatePassword,
} from '@/lib/auth-utils';

async function postHandler(request: NextRequest) {
	const body = await request.json();
	const { email, password, name } = body;

	// Validate required fields
	if (!email || !password) {
		return NextResponse.json(
			{ message: 'Email and password are required' },
			{ status: 400 },
		);
	}

	// Validate email format
	const emailValidation = validateEmail(email);
	if (!emailValidation.isValid) {
		return NextResponse.json(
			{ message: emailValidation.message },
			{ status: 400 },
		);
	}

	// Validate password strength
	const passwordValidation = validatePassword(password);
	if (!passwordValidation.isValid) {
		return NextResponse.json(
			{ message: passwordValidation.message },
			{ status: 400 },
		);
	}

	const db = getDb();

	// Check if user already exists
	const existingUsers = await db
		.select()
		.from(users)
		.where(eq(users.email, email));

	if (existingUsers.length > 0) {
		return NextResponse.json(
			{ message: 'User with this email already exists' },
			{ status: 409 },
		);
	}

	// Hash password
	const hashedPassword = await hashPassword(password);

	// Create user
	const now = new Date();
	const id = uuidv4();

	await db.insert(users).values({
		id,
		email,
		password: hashedPassword,
		name: name || null,
		isGuest: false,
		createdAt: now,
		updatedAt: now,
	});

	// Return user without password
	const [newUser] = await db.select().from(users).where(eq(users.id, id));

	const userResponse = {
		id: newUser.id,
		email: newUser.email,
		name: newUser.name,
		isGuest: newUser.isGuest,
		createdAt: new Date(newUser.createdAt),
		updatedAt: new Date(newUser.updatedAt),
	};

	return NextResponse.json(userResponse, { status: 201 });
}

export const POST = withDb(postHandler);
