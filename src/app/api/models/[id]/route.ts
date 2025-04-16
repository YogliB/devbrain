import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { join } from 'path';

// Helper function to get database connection
function getDb() {
	const dbPath = join(process.cwd(), 'devbrain.db');
	return new Database(dbPath);
}

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
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
			...model,
			isDownloaded: Boolean(model.isDownloaded),
		};

		db.close();

		return NextResponse.json(formattedModel);
	} catch (error) {
		console.error(`Error fetching model ${params.id}:`, error);
		return NextResponse.json(
			{ message: 'Failed to fetch model', error: String(error) },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
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
			...updatedModel,
			isDownloaded: Boolean(updatedModel.isDownloaded),
		};

		db.close();

		return NextResponse.json(formattedModel);
	} catch (error) {
		console.error(`Error updating model ${params.id}:`, error);
		return NextResponse.json(
			{ message: 'Failed to update model', error: String(error) },
			{ status: 500 },
		);
	}
}
