import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { notebooks, sources } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { withDb } from '@/middleware/db-middleware';

async function getHandler(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string; id: string }> },
) {
	const { notebookId, id } = await params;
	const db = getDb();

	const [source] = await db
		.select()
		.from(sources)
		.where(and(eq(sources.id, id), eq(sources.notebookId, notebookId)));

	if (!source) {
		return NextResponse.json(
			{ message: 'Source not found' },
			{ status: 404 },
		);
	}

	const formattedSource = {
		...source,
		createdAt: new Date(source.createdAt),
	};

	return NextResponse.json(formattedSource);
}

export const GET = withDb(getHandler);

async function putHandler(
	request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string; id: string }> },
) {
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
}

export const PUT = withDb(putHandler);

async function deleteHandler(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string; id: string }> },
) {
	const { notebookId, id } = await params;
	const db = getDb();

	const [existingSource] = await db
		.select()
		.from(sources)
		.where(and(eq(sources.id, id), eq(sources.notebookId, notebookId)));

	if (!existingSource) {
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
}

export const DELETE = withDb(deleteHandler);
