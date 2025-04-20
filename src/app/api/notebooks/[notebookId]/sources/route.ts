import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { notebooks, sources } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
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

	const sourcesData = await db
		.select()
		.from(sources)
		.where(eq(sources.notebookId, notebookId))
		.orderBy(desc(sources.createdAt));

	const formattedSources = sourcesData.map((source) => ({
		...source,
		createdAt: new Date(source.createdAt),
	}));

	return NextResponse.json(formattedSources);
}

export const GET = withDb(getHandler);

async function postHandler(
	request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	const { notebookId } = await params;
	const body = await request.json();
	const { content, filename, tag } = body;

	if (!content) {
		return NextResponse.json(
			{ message: 'Content is required' },
			{ status: 400 },
		);
	}

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

	const id = uuidv4();
	const now = new Date();

	await db.insert(sources).values({
		id,
		content,
		filename: filename || null,
		tag: tag || null,
		notebookId,
		createdAt: now,
	});

	const [newSource] = await db
		.select()
		.from(sources)
		.where(eq(sources.id, id));

	const formattedSource = {
		...newSource,
		createdAt: new Date(newSource.createdAt),
	};

	await db
		.update(notebooks)
		.set({ updatedAt: now })
		.where(eq(notebooks.id, notebookId));

	return NextResponse.json(formattedSource, { status: 201 });
}

export const POST = withDb(postHandler);
