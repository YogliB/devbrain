import { NextResponse } from 'next/server';
import { initDb, ensureDatabaseExists, closeDb } from '@/db';
import { spawn } from 'child_process';

async function runProcessWithTimeout(
	command: string,
	args: string[],
	timeoutMs: number = 5000,
) {
	const process = spawn(command, args);

	return new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(() => {
			process.kill();
			reject(
				new Error(
					`Process ${command} ${args.join(' ')} timed out after ${timeoutMs}ms`,
				),
			);
		}, timeoutMs);

		process.on('close', (code: number) => {
			clearTimeout(timeout);
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Process exited with code ${code}`));
			}
		});

		process.on('error', (err) => {
			clearTimeout(timeout);
			reject(err);
		});
	});
}

export async function GET() {
	try {
		const isDev = process.env.NODE_ENV === 'development';

		if (!isDev) {
			ensureDatabaseExists();
			return NextResponse.json({
				success: true,
				message: 'Database existence verified',
			});
		}

		if (isDev) {
			const dbExisted = ensureDatabaseExists();
			console.log(`Database existed before initialization: ${dbExisted}`);

			await initDb(true);

			try {
				await runProcessWithTimeout('npm', ['run', 'db:push'], 8000);
				console.log('Schema push completed successfully');
			} catch (error) {
				console.error('Schema push failed:', error);
			}

			closeDb();
			await initDb(true);

			try {
				await runProcessWithTimeout('npm', ['run', 'db:seed'], 8000);
				console.log('Database seeding completed successfully');
			} catch (error) {
				console.error('Database seeding failed:', error);
			}

			closeDb();

			return NextResponse.json({
				success: true,
				message: 'Database initialization process completed',
			});
		}

		return NextResponse.json({
			success: true,
			message: 'Database initialization skipped',
		});
	} catch (error) {
		console.error('Error initializing database:', error);
		// Make sure to close the database connection on error
		closeDb();
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
