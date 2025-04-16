import { NextRequest, NextResponse } from 'next/server';
import { getDb, closeDb } from '@/db';
import { notebooks, sources } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string; id: string }> },
) {
	try {
		const { notebookId, id } = await params;
		const db = getDb();

		const [source] = await db
			.select()
			.from(sources)
			.where(and(eq(sources.id, id), eq(sources.notebookId, notebookId)));

		if (!source) {
			closeDb();
			return NextResponse.json(
				{ message: 'Source not found' },
				{ status: 404 },
			);
		}

		const formattedSource = {
			...source,
			createdAt: new Date(source.createdAt),
		};

		closeDb();

		return NextResponse.json(formattedSource);
	} catch (error) {
		const { id } = await params;
		console.error(`Error fetching source ${id}:`, error);
		return NextResponse.json(
			{ message: 'Failed to fetch source', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string; id: string }> },
) {
	try {
		const { notebookId, id } = await params;
		const body = await request.json();
		const { content, filename, tag } = body;

		if (!content) {
			return NextResponse.json(
				{ message: 'Content is required' },
				{ status: 400 },
			);
		}

		const db = getDb();

		const [existingSource] = await db
			.select()
			.from(sources)
			.where(and(eq(sources.id, id), eq(sources.notebookId, notebookId)));

		if (!existingSource) {
			closeDb();
			return NextResponse.json(
				{ message: 'Source not found' },
				{ status: 404 },
			);
		}

		const now = new Date();

		await db
			.update(sources)
			.set({
				content,
				filename: filename || null,
				tag: tag || null,
			})
			.where(and(eq(sources.id, id), eq(sources.notebookId, notebookId)));

		const [updatedSource] = await db
			.select()
			.from(sources)
			.where(eq(sources.id, id));

		const formattedSource = {
			...updatedSource,
			createdAt: new Date(updatedSource.createdAt),
		};

		await db
			.update(notebooks)
			.set({ updatedAt: now })
			.where(eq(notebooks.id, notebookId));

		return NextResponse.json(formattedSource);
	} catch (error) {
		const { id } = await params;
		console.error(`Error updating source ${id}:`, error);
		return NextResponse.json(
			{ message: 'Failed to update source', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string; id: string }> },
) {
	try {
		const { notebookId, id } = await params;
		const db = getDb();

		const [existingSource] = await db
			.select()
			.from(sources)
			.where(and(eq(sources.id, id), eq(sources.notebookId, notebookId)));

		if (!existingSource) {
			closeDb();
			return NextResponse.json(
				{ message: 'Source not found' },
				{ status: 404 },
			);
		}

		await db
			.delete(sources)
			.where(and(eq(sources.id, id), eq(sources.notebookId, notebookId)));

		const now = new Date();
		await db
			.update(notebooks)
			.set({ updatedAt: now })
			.where(eq(notebooks.id, notebookId));

		return NextResponse.json({ message: 'Source deleted successfully' });
	} catch (error) {
		const { id } = await params;
		console.error(`Error deleting source ${id}:`, error);
		return NextResponse.json(
			{ message: 'Failed to delete source', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}
