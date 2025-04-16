import { NextResponse } from 'next/server';
import { getDb, closeDb } from '@/db';
import { models } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
	try {
		const db = getDb();

		// Get all models ordered by name
		const modelsData = await db
			.select()
			.from(models)
			.orderBy(asc(models.name));

		// No need to convert boolean values as drizzle handles this

		closeDb();

		return NextResponse.json(modelsData);
	} catch (error) {
		console.error('Error fetching models:', error);
		return NextResponse.json(
			{ message: 'Failed to fetch models', error: String(error) },
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}
