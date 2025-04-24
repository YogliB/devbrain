import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withDb } from '@/middleware/db-middleware';
import { verifyPassword } from '@/lib/auth-utils';

async function postHandler(request: NextRequest) {
	const body = await request.json();
	const { email, password } = body;

	// Validate required fields
	if (!email || !password) {
		return NextResponse.json(
			{ message: 'Email and password are required' },
			{ status: 400 },
		);
	}

	const db = getDb();

	// Find user by email
	const existingUsers = await db
		.select()
		.from(users)
		.where(eq(users.email, email));

	if (existingUsers.length === 0) {
		return NextResponse.json(
			{ message: 'Invalid email or password' },
			{ status: 401 },
		);
	}

	const user = existingUsers[0];

	// Verify password
	const isPasswordValid = await verifyPassword(password, user.password);

	if (!isPasswordValid) {
		return NextResponse.json(
			{ message: 'Invalid email or password' },
			{ status: 401 },
		);
	}

	// Return user without password
	const userResponse = {
		id: user.id,
		email: user.email,
		name: user.name,
		isGuest: user.isGuest,
		createdAt: new Date(user.createdAt),
		updatedAt: new Date(user.updatedAt),
	};

	return NextResponse.json(userResponse);
}

export const POST = withDb(postHandler);
