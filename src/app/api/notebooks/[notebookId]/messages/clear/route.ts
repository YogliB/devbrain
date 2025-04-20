import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { notebooks, messages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withDb } from '@/middleware/db-middleware';

async function deleteHandler(
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

	await db.delete(messages).where(eq(messages.notebookId, notebookId));

	const now = new Date();
	await db
		.update(notebooks)
		.set({ updatedAt: now })
		.where(eq(notebooks.id, notebookId));

	return NextResponse.json({
		message: 'All messages cleared successfully',
	});
}

export const DELETE = withDb(deleteHandler);
