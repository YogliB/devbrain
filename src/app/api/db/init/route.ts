import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const { spawn } = require('child_process');
		const process = spawn('npm', ['run', 'db:init']);

		await new Promise<void>((resolve, reject) => {
			process.on('close', (code: number) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`Process exited with code ${code}`));
				}
			});
		});

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
