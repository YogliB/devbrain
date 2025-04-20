import { NextRequest, NextResponse } from 'next/server';
import { getDb, closeDb } from '@/db';
import { notebooks, messages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	try {
		const { notebookId } = await params;
		const db = getDb();

		const [notebook] = await db
			.select()
			.from(notebooks)
			.where(eq(notebooks.id, notebookId));

		if (!notebook) {
			closeDb();
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

		closeDb();

		return NextResponse.json({
			message: 'All messages cleared successfully',
		});
	} catch (error) {
		const { notebookId } = await params;
		console.error(
			`Error clearing messages for notebook ${notebookId}:`,
			error,
		);
		return NextResponse.json(
			{ message: 'Failed to clear messages', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}
