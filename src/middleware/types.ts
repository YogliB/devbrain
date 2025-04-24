import { NextRequest, NextResponse } from 'next/server';

export interface NextApiContext {
	userId?: string;
	[key: string]: unknown;
}

export type NextApiHandler<T extends NextApiContext = NextApiContext> = (
	req: NextRequest,
	context: T,
) => Promise<NextResponse> | NextResponse;
