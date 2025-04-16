import { NextRequest, NextResponse } from 'next/server';
import { getDb, closeDb } from '@/db';
import { models } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const db = getDb();

		const [model] = await db.select().from(models).where(eq(models.id, id));

		if (!model) {
			closeDb();
			return NextResponse.json(
				{ message: 'Model not found' },
				{ status: 404 },
			);
		}

		return NextResponse.json(model);
	} catch (error) {
		const { id } = await params;
		console.error(`Error fetching model ${id}:`, error);
		return NextResponse.json(
			{ message: 'Failed to fetch model', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const { webLLMId } = body;

		const db = getDb();

		const [existingModel] = await db
			.select()
			.from(models)
			.where(eq(models.id, id));

		if (!existingModel) {
			closeDb();
			return NextResponse.json(
				{ message: 'Model not found' },
				{ status: 404 },
			);
		}

		const updateData: Partial<typeof models.$inferInsert> = {};

		// Only update fields that were provided
		if (webLLMId !== undefined) {
			updateData.webLLMId = webLLMId;
		}

		// If we have data to update
		if (Object.keys(updateData).length > 0) {
			await db.update(models).set(updateData).where(eq(models.id, id));
		}

		const [updatedModel] = await db
			.select()
			.from(models)
			.where(eq(models.id, id));

		return NextResponse.json(updatedModel);
	} catch (error) {
		const { id } = await params;
		console.error(`Error updating model ${id}:`, error);
		return NextResponse.json(
			{ message: 'Failed to update model', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}
