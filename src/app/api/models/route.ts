import { NextResponse } from 'next/server';
import { getDb, closeDb } from '@/db';
import { models } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
	try {
		const db = getDb();

		const modelsData = await db
			.select()
			.from(models)
			.orderBy(asc(models.name));

		// Add runtime properties to each model
		const enhancedModels = modelsData.map((model) => ({
			...model,
			isDownloaded: false, // Default to false, will be updated by client
			downloadStatus: 'not-downloaded' as const,
			downloadProgress: 0,
		}));

		closeDb();

		return NextResponse.json(enhancedModels);
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
