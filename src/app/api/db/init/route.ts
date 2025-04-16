import { NextResponse } from 'next/server';
import { initDb } from '@/db';
import { models } from '@/db/schema';

export async function GET() {
	try {
		// Initialize the database (runs migrations)
		const db = await initDb();

		// Seed default models if none exist
		const existingModels = await db.select().from(models);

		if (existingModels.length === 0) {
			// Insert default models
			await db.insert(models).values([
				{
					id: '1',
					name: 'TinyLlama',
					isDownloaded: true,
					parameters: '1.1B',
					size: '600MB',
					useCase: 'Fast responses, lower accuracy',
				},
				{
					id: '2',
					name: 'Mistral',
					isDownloaded: true,
					parameters: '7B',
					size: '4GB',
					useCase: 'Balanced performance and accuracy',
				},
				{
					id: '3',
					name: 'Phi-3',
					isDownloaded: false,
					parameters: '3.8B',
					size: '2.2GB',
					useCase: 'Optimized for coding tasks',
				},
				{
					id: '4',
					name: 'Llama 3',
					isDownloaded: false,
					parameters: '8B',
					size: '4.5GB',
					useCase: 'High accuracy, slower responses',
				},
			]);
		}

		return NextResponse.json({
			success: true,
			message: 'Database initialized successfully',
		});
	} catch (error) {
		console.error('Error initializing database:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Failed to initialize database',
				error: String(error),
			},
			{ status: 500 },
		);
	}
}
