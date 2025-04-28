import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { notebooks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { withDbAndAuth } from '@/middleware/auth-middleware';
import { searchSimilarChunks } from '@/lib/vector-search-service';
import { sanitizeInput } from '@/lib/sanitize-utils';

interface VectorSearchRequest {
	query: string;
	topK?: number;
}

async function postHandler(
	request: NextRequest,
	{
		params,
		...context
	}: { params: Promise<{ notebookId: string }> } & Record<string, unknown>,
) {
	const { notebookId } = await params;
	const userId = context.userId as string;
	const db = getDb();

	// Verify notebook exists and belongs to user
	const [notebook] = await db
		.select()
		.from(notebooks)
		.where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, userId)));

	if (!notebook) {
		return NextResponse.json(
			{ message: 'Notebook not found' },
			{ status: 404 },
		);
	}

	// Parse request body
	let body: VectorSearchRequest;
	try {
		body = await request.json();
	} catch (error) {
		return NextResponse.json(
			{ message: 'Invalid request body' },
			{ status: 400 },
		);
	}

	// Validate request
	if (!body.query) {
		return NextResponse.json(
			{ message: 'Query is required' },
			{ status: 400 },
		);
	}

	// Sanitize input
	const sanitizedQuery = sanitizeInput(body.query);

	// Perform vector search
	try {
		const results = await searchSimilarChunks(
			sanitizedQuery,
			notebookId,
			userId,
			body.topK,
		);

		return NextResponse.json(results);
	} catch (error) {
		console.error('Error performing vector search:', error);
		return NextResponse.json(
			{ message: 'Error performing vector search' },
			{ status: 500 },
		);
	}
}

export const POST = withDbAndAuth(postHandler);
