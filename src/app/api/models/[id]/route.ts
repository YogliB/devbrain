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
		const { isDownloaded } = body;

		if (isDownloaded === undefined) {
			return NextResponse.json(
				{ message: 'isDownloaded field is required' },
				{ status: 400 },
			);
		}

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

		await db
			.update(models)
			.set({ isDownloaded: isDownloaded })
			.where(eq(models.id, id));

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
