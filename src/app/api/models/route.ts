import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { join } from 'path';

// Helper function to get database connection
function getDb() {
	const dbPath = join(process.cwd(), 'devbrain.db');
	return new Database(dbPath);
}

export async function GET() {
	try {
		const db = getDb();

		const models = db
			.prepare(
				`
      SELECT id, name, is_downloaded as isDownloaded, parameters, size, use_case as useCase
      FROM models
      ORDER BY name ASC
    `,
			)
			.all();

		// Convert boolean values
		const formattedModels = models.map((model: any) => ({
			...model,
			isDownloaded: Boolean(model.isDownloaded),
		}));

		db.close();

		return NextResponse.json(formattedModels);
	} catch (error) {
		console.error('Error fetching models:', error);
		return NextResponse.json(
			{ message: 'Failed to fetch models', error: String(error) },
			{ status: 500 },
		);
	}
}
