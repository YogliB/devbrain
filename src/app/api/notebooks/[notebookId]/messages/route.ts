import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { notebooks, messages } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { withDb } from '@/middleware/db-middleware';

async function getHandler(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	const { notebookId } = await params;
	const db = getDb();

	const [notebook] = await db
		.select()
		.from(notebooks)
		.where(eq(notebooks.id, notebookId));

	if (!notebook) {
		return NextResponse.json(
			{ message: 'Notebook not found' },
			{ status: 404 },
		);
	}

	const messagesData = await db
		.select()
		.from(messages)
		.where(eq(messages.notebookId, notebookId))
		.orderBy(asc(messages.timestamp));

	const formattedMessages = messagesData.map((message) => ({
		...message,
		timestamp: new Date(message.timestamp),
	}));

	return NextResponse.json(formattedMessages);
}

export const GET = withDb(getHandler);

async function postHandler(
	request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	const { notebookId } = await params;
	const body = await request.json();
	const { content, role } = body;

	if (!content) {
		return NextResponse.json(
			{ message: 'Content is required' },
			{ status: 400 },
		);
	}

	if (!role || !['user', 'assistant'].includes(role)) {
		return NextResponse.json(
			{ message: 'Role must be either "user" or "assistant"' },
			{ status: 400 },
		);
	}

	const db = getDb();

	const [notebook] = await db
		.select()
		.from(notebooks)
		.where(eq(notebooks.id, notebookId));

	if (!notebook) {
		return NextResponse.json(
			{ message: 'Notebook not found' },
			{ status: 404 },
		);
	}

	const id = `${Date.now()}`;
	const now = new Date();

	await db.insert(messages).values({
		id,
		content,
		role: role as 'user' | 'assistant',
		notebookId,
		timestamp: now,
	});

	const [newMessage] = await db
		.select()
		.from(messages)
		.where(eq(messages.id, id));

	await db
		.update(notebooks)
		.set({ updatedAt: now })
		.where(eq(notebooks.id, notebookId));

	const formattedMessage = {
		...newMessage,
		timestamp: new Date(newMessage.timestamp),
	};

	return NextResponse.json(formattedMessage, { status: 201 });
}

export const POST = withDb(postHandler);
