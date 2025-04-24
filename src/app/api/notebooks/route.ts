import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { notebooks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { withDbAndAuth } from '@/middleware/auth-middleware';
import { NextApiContext } from '@/middleware/types';

async function getHandler(_request: NextRequest, context: NextApiContext) {
	const userId = context.userId as string;
	if (!userId) {
		return NextResponse.json(
			{ message: 'User ID is required' },
			{ status: 401 },
		);
	}
	const db = getDb();

	// Filter notebooks by user ID
	const notebooksData = await db
		.select()
		.from(notebooks)
		.where(eq(notebooks.userId, userId))
		.orderBy(notebooks.updatedAt);

	const formattedNotebooks = notebooksData.map((notebook) => ({
		...notebook,
		createdAt: new Date(notebook.createdAt),
		updatedAt: new Date(notebook.updatedAt),
	}));

	return NextResponse.json(formattedNotebooks);
}

export const GET = withDbAndAuth(getHandler);

async function postHandler(request: NextRequest, context: NextApiContext) {
	const body = await request.json();
	const { title } = body;
	const userId = context.userId as string;

	if (!userId) {
		return NextResponse.json(
			{ message: 'User ID is required' },
			{ status: 401 },
		);
	}

	if (!title) {
		return NextResponse.json(
			{ message: 'Title is required' },
			{ status: 400 },
		);
	}

	const db = getDb();

	const now = new Date();
	const id = uuidv4();

	await db.insert(notebooks).values({
		id,
		title,
		userId,
		createdAt: now,
		updatedAt: now,
	});

	const [newNotebook] = await db
		.select()
		.from(notebooks)
		.where(eq(notebooks.id, id));

	const formattedNotebook = {
		...newNotebook,
		createdAt: new Date(newNotebook.createdAt),
		updatedAt: new Date(newNotebook.updatedAt),
	};

	return NextResponse.json(formattedNotebook, { status: 201 });
}

export const POST = withDbAndAuth(postHandler);
