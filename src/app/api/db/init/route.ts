import { NextResponse } from 'next/server';
import { initDb, ensureDatabaseExists, closeDb } from '@/db';
import { spawn } from 'child_process';

async function runProcessWithTimeout(
	command: string,
	args: string[],
	timeoutMs: number = 1000, // Reduced timeout to 1 second
) {
	const process = spawn(command, args);

	return new Promise<void>((resolve) => {
		const timeout = setTimeout(() => {
			process.kill();
			console.warn(
				`Process ${command} ${args.join(' ')} timed out after ${timeoutMs}ms, but continuing anyway`,
			);
			resolve();
		}, timeoutMs);

		process.on('close', (code: number) => {
			clearTimeout(timeout);
			if (code === 0) {
				resolve();
			} else {
				console.warn(
					`Process exited with code ${code}, but continuing anyway`,
				);
				resolve();
			}
		});

		process.on('error', (err) => {
			clearTimeout(timeout);
			console.warn('Process error:', err, 'but continuing anyway');
			resolve();
		});
	});
}

export async function GET() {
	try {
		const isDev = process.env.NODE_ENV === 'development';

		const dbExisted = ensureDatabaseExists();
		console.log(`Database existed before initialization: ${dbExisted}`);

		await initDb(false);

		if (isDev) {
			// Run these processes in parallel with shorter timeouts
			Promise.all([
				runProcessWithTimeout('npm', ['run', 'db:push'], 1000)
					.then(() => console.log('Schema push completed'))
					.catch(() => {}),
				runProcessWithTimeout('npm', ['run', 'db:seed'], 1000)
					.then(() => console.log('Database seeding completed'))
					.catch(() => {}),
			]).catch(() => {});
		}

		return NextResponse.json({
			success: true,
			message: 'Database initialization started',
		});
	} catch (error) {
		console.error('Error initializing database:', error);
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
