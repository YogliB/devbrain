import { NextRequest, NextResponse } from 'next/server';
import { getDb, closeDb } from '@/db';
import { NextApiContext, NextApiHandler } from './types';

export function withDb<T extends NextApiContext>(
	handler: NextApiHandler<T>,
): NextApiHandler<T> {
	return async (req: NextRequest, context: T) => {
		try {
			const db = getDb();
			const response = await handler(req, context);
			return response;
		} catch (error) {
			console.error('Database middleware error:', error);
			return NextResponse.json(
				{ message: 'Internal server error', error: String(error) },
				{ status: 500 },
			);
		} finally {
			closeDb();
		}
	};
}
