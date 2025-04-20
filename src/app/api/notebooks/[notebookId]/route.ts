import { NextRequest, NextResponse } from 'next/server';
import { getDb, closeDb, initDb } from '@/db';
import { notebooks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	try {
		// Initialize the database first
		await initDb();

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
	} catch (error) {
		const { notebookId } = await params;
		console.error(`Error fetching notebook ${notebookId}:`, error);
		return NextResponse.json(
			{ message: 'Failed to fetch notebook', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	try {
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
	} catch (error) {
		const { notebookId } = await params;
		console.error(`Error updating notebook ${notebookId}:`, error);
		return NextResponse.json(
			{ message: 'Failed to update notebook', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	try {
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
	} catch (error) {
		const { notebookId } = await params;
		console.error(`Error deleting notebook ${notebookId}:`, error);
		return NextResponse.json(
			{ message: 'Failed to delete notebook', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}
