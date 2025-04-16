import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { join } from 'path';

// Helper function to get database connection
function getDb() {
	const dbPath = join(process.cwd(), 'devbrain.db');
	return new Database(dbPath);
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const db = getDb();

		const model = db
			.prepare(
				`
      SELECT id, name, is_downloaded as isDownloaded, parameters, size, use_case as useCase
      FROM models
      WHERE id = ?
    `,
			)
			.get(id);

		if (!model) {
			db.close();
			return NextResponse.json(
				{ message: 'Model not found' },
				{ status: 404 },
			);
		}

		// Convert boolean value
		const formattedModel = {
			...(model as any),
			isDownloaded: Boolean((model as any).isDownloaded),
		};

		db.close();

		return NextResponse.json(formattedModel);
	} catch (error) {
		const { id } = await params;
		console.error(`Error fetching model ${id}:`, error);
		return NextResponse.json(
			{ message: 'Failed to fetch model', error: String(error) },
			{ status: 500 },
		);
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

		// Check if model exists
		const existingModel = db
			.prepare('SELECT id FROM models WHERE id = ?')
			.get(id);

		if (!existingModel) {
			db.close();
			return NextResponse.json(
				{ message: 'Model not found' },
				{ status: 404 },
			);
		}

		db.prepare(
			`
      UPDATE models
      SET is_downloaded = ?
      WHERE id = ?
    `,
		).run(isDownloaded ? 1 : 0, id);

		const updatedModel = db
			.prepare(
				`
      SELECT id, name, is_downloaded as isDownloaded, parameters, size, use_case as useCase
      FROM models
      WHERE id = ?
    `,
			)
			.get(id);

		// Convert boolean value
		const formattedModel = {
			...(updatedModel as any),
			isDownloaded: Boolean((updatedModel as any).isDownloaded),
		};

		db.close();

		return NextResponse.json(formattedModel);
	} catch (error) {
		const { id } = await params;
		console.error(`Error updating model ${id}:`, error);
		return NextResponse.json(
			{ message: 'Failed to update model', error: String(error) },
			{ status: 500 },
		);
	}
}
