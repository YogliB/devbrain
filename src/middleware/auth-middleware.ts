import { NextRequest, NextResponse } from 'next/server';
import { withDb } from './db-middleware';
import { NextApiContext, NextApiHandler } from './types';

/**
 * Middleware to extract the user ID from the request
 * This ensures that data can be filtered based on the current user
 */
export function withAuth<T extends NextApiContext>(
	handler: NextApiHandler<T>,
): NextApiHandler<T> {
	return async (req: NextRequest, context: T) => {
		try {
			// Get the user ID from the request headers
			// In a real-world scenario, this would typically come from a JWT token or session
			// For this implementation, we'll use a custom header that the frontend will set
			const userId = req.headers.get('x-user-id');

			if (!userId) {
				return NextResponse.json(
					{ message: 'Unauthorized - User ID not provided' },
					{ status: 401 },
				);
			}

			// Add the userId to the context so it can be accessed by the handler
			context.userId = userId;

			// Call the original handler
			return handler(req, context);
		} catch (error) {
			console.error('Authentication middleware error:', error);
			return NextResponse.json(
				{ message: 'Internal server error', error: String(error) },
				{ status: 500 },
			);
		}
	};
}

/**
 * Combines database and authentication middleware
 */
export function withDbAndAuth<T extends NextApiContext>(
	handler: NextApiHandler<T>,
): NextApiHandler<T> {
	// Apply both middlewares
	// First apply the auth middleware, then the db middleware
	return withDb(withAuth(handler));
}
