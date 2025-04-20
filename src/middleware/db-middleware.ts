import { NextRequest, NextResponse } from 'next/server';
import { getDb, closeDb } from '@/db';

type NextApiHandler = (
	req: NextRequest,
	context: any,
) => Promise<NextResponse> | NextResponse;

export function withDb(handler: NextApiHandler): NextApiHandler {
	return async (req: NextRequest, context: any) => {
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
