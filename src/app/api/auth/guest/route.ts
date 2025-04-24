import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { withDb } from '@/middleware/db-middleware';
import { hashPassword } from '@/lib/auth-utils';

async function postHandler(request: NextRequest) {
	const db = getDb();

	// Create a guest user with a random email and password
	const now = new Date();
	const id = uuidv4();
	const guestEmail = `guest-${id}@devbrain.local`;
	const guestPassword = uuidv4();
	const hashedPassword = await hashPassword(guestPassword);

	await db.insert(users).values({
		id,
		email: guestEmail,
		password: hashedPassword,
		name: 'Guest User',
		isGuest: true,
		createdAt: now,
		updatedAt: now,
	});

	// Return guest user info
	const userResponse = {
		id,
		email: guestEmail,
		name: 'Guest User',
		isGuest: true,
		createdAt: now,
		updatedAt: now,
	};

	return NextResponse.json(userResponse, { status: 201 });
}

export const POST = withDb(postHandler);
