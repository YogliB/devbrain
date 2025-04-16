import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { initDb, ensureDatabaseExists } from '@/db';

export async function GET(request: NextRequest) {
	try {
		// Check if we should force migrations
		const searchParams = request.nextUrl.searchParams;
		const forceMigrate = searchParams.get('forceMigrate') === 'true';
		const isDev = process.env.NODE_ENV === 'development';

		// In production, only ensure the database exists unless forceMigrate is true
		if (!isDev && !forceMigrate) {
			ensureDatabaseExists();
			return NextResponse.json({
				success: true,
				message: 'Database existence verified',
			});
		}

		// In development or if forceMigrate is true, run the full initialization
		if (isDev || forceMigrate) {
			// Use the initDb function directly instead of spawning a process
			await initDb(true);

			// Run the seed script if needed
			const { spawn } = require('child_process');
			const process = spawn('npm', ['run', 'db:seed']);

			await new Promise<void>((resolve, reject) => {
				process.on('close', (code: number) => {
					if (code === 0) {
						resolve();
					} else {
						reject(new Error(`Seed process exited with code ${code}`));
					}
				});
			});

			return NextResponse.json({
				success: true,
				message: 'Database initialized and seeded successfully',
			});
		}

		return NextResponse.json({
			success: true,
			message: 'Database initialization skipped',
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
