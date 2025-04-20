import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { notebooks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withDb } from '@/middleware/db-middleware';

async function getHandler(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	const { notebookId } = await params;
	const db = getDb();

	const [notebook] = await db
		.select()
		.from(notebooks)
		.where(eq(notebooks.id, notebookId));

	if (!notebook) {
		return NextResponse.json(
			{ message: 'Notebook not found' },
			{ status: 404 },
		);
	}

	const formattedNotebook = {
		...notebook,
		createdAt: new Date(notebook.createdAt),
		updatedAt: new Date(notebook.updatedAt),
	};

	return NextResponse.json(formattedNotebook);
}

export const GET = withDb(getHandler);

async function putHandler(
	request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	const { notebookId } = await params;
	const body = await request.json();
	const { title } = body;

	if (!title) {
		return NextResponse.json(
			{ message: 'Title is required' },
			{ status: 400 },
		);
	}

	const db = getDb();

	const [existingNotebook] = await db
		.select()
		.from(notebooks)
		.where(eq(notebooks.id, notebookId));

	if (!existingNotebook) {
		return NextResponse.json(
			{ message: 'Notebook not found' },
			{ status: 404 },
		);
	}

	const now = new Date();

	await db
		.update(notebooks)
		.set({
			title,
			updatedAt: now,
		})
		.where(eq(notebooks.id, notebookId));

	const [updatedNotebook] = await db
		.select()
		.from(notebooks)
		.where(eq(notebooks.id, notebookId));

	const formattedNotebook = {
		...updatedNotebook,
		createdAt: new Date(updatedNotebook.createdAt),
		updatedAt: new Date(updatedNotebook.updatedAt),
	};

	return NextResponse.json(formattedNotebook);
}

export const PUT = withDb(putHandler);

async function deleteHandler(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	const { notebookId } = await params;
	const db = getDb();

	const [existingNotebook] = await db
		.select()
		.from(notebooks)
		.where(eq(notebooks.id, notebookId));

	if (!existingNotebook) {
		return NextResponse.json(
			{ message: 'Notebook not found' },
			{ status: 404 },
		);
	}

	await db.delete(notebooks).where(eq(notebooks.id, notebookId));

	return NextResponse.json({ message: 'Notebook deleted successfully' });
}

export const DELETE = withDb(deleteHandler);
