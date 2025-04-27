import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { notebooks, sources } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { withDbAndAuth } from '@/middleware/auth-middleware';
import {
	updateSourceChunks,
	deleteSourceChunks,
} from '@/lib/source-embedding-service';

async function getHandler(
	_request: NextRequest,
	{
		params,
		...context
	}: { params: Promise<{ notebookId: string; id: string }> } & Record<
		string,
		unknown
	>,
) {
	const { notebookId, id } = await params;
	const userId = context.userId as string;
	const db = getDb();

	const [source] = await db
		.select()
		.from(sources)
		.where(
			and(
				eq(sources.id, id),
				eq(sources.notebookId, notebookId),
				eq(sources.userId, userId),
			),
		);

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

export const GET = withDbAndAuth(getHandler);

async function putHandler(
	request: NextRequest,
	{
		params,
		...context
	}: { params: Promise<{ notebookId: string; id: string }> } & Record<
		string,
		unknown
	>,
) {
	const { notebookId, id } = await params;
	const userId = context.userId as string;
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
		.where(
			and(
				eq(sources.id, id),
				eq(sources.notebookId, notebookId),
				eq(sources.userId, userId),
			),
		);

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
		.where(
			and(
				eq(sources.id, id),
				eq(sources.notebookId, notebookId),
				eq(sources.userId, userId),
			),
		);

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

	// Update source chunks and embeddings
	try {
		await updateSourceChunks(id, existingSource.userId);
	} catch (error) {
		console.error('Error updating source embeddings:', error);
		// Continue even if embedding fails - don't block the source update
	}

	return NextResponse.json(formattedSource);
}

export const PUT = withDbAndAuth(putHandler);

async function deleteHandler(
	_request: NextRequest,
	{
		params,
		...context
	}: { params: Promise<{ notebookId: string; id: string }> } & Record<
		string,
		unknown
	>,
) {
	const { notebookId, id } = await params;
	const userId = context.userId as string;
	const db = getDb();

	const [existingSource] = await db
		.select()
		.from(sources)
		.where(
			and(
				eq(sources.id, id),
				eq(sources.notebookId, notebookId),
				eq(sources.userId, userId),
			),
		);

	if (!existingSource) {
		return NextResponse.json(
			{ message: 'Source not found' },
			{ status: 404 },
		);
	}

	// Delete source chunks and embeddings first
	try {
		await deleteSourceChunks(id, existingSource.userId);
	} catch (error) {
		console.error('Error deleting source embeddings:', error);
		// Continue even if embedding deletion fails
	}

	// Then delete the source itself
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

export const DELETE = withDbAndAuth(deleteHandler);
