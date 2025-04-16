import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { initDb, ensureDatabaseExists } from '@/db';
import { spawn } from 'child_process';

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const forceInit = searchParams.get('forceInit') === 'true';
		const isDev = process.env.NODE_ENV === 'development';

		if (!isDev && !forceInit) {
			ensureDatabaseExists();
			return NextResponse.json({
				success: true,
				message: 'Database existence verified',
			});
		}

		if (isDev || forceInit) {
			const pushProcess = spawn('npm', ['run', 'db:push']);

			await new Promise<void>((resolve, reject) => {
				pushProcess.on('close', (code: number) => {
					if (code === 0) {
						resolve();
					} else {
						reject(
							new Error(
								`Schema push process exited with code ${code}`,
							),
						);
					}
				});
			});

			await initDb(true);

			const seedProcess = spawn('npm', ['run', 'db:seed']);

			await new Promise<void>((resolve, reject) => {
				seedProcess.on('close', (code: number) => {
					if (code === 0) {
						resolve();
					} else {
						reject(
							new Error(`Seed process exited with code ${code}`),
						);
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
