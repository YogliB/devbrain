import { NextRequest, NextResponse } from 'next/server';
import { getDb, closeDb } from '@/db';
import { notebooks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
	try {
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
	} catch (error) {
		console.error('Error fetching notebooks:', error);
		return NextResponse.json(
			{ message: 'Failed to fetch notebooks', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}

export async function POST(request: NextRequest) {
	try {
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
	} catch (error) {
		console.error('Error creating notebook:', error);
		return NextResponse.json(
			{ message: 'Failed to create notebook', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}
