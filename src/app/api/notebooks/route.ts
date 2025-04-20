import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { notebooks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { withDb } from '@/middleware/db-middleware';

async function getHandler() {
	const db = getDb();

	const notebooksData = await db
		.select()
		.from(notebooks)
		.orderBy(notebooks.updatedAt);

	const formattedNotebooks = notebooksData.map((notebook) => ({
		...notebook,
		createdAt: new Date(notebook.createdAt),
		updatedAt: new Date(notebook.updatedAt),
	}));

	return NextResponse.json(formattedNotebooks);
}

export const GET = withDb(getHandler);

async function postHandler(request: NextRequest) {
	const body = await request.json();
	const { title } = body;

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

export const POST = withDb(postHandler);
