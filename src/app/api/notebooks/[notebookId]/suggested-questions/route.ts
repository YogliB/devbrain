import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { notebooks, suggestedQuestions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { withDb } from '@/middleware/db-middleware';
import { sanitizeInput } from '@/lib/sanitize-utils';

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

	const questionsData = await db
		.select()
		.from(suggestedQuestions)
		.where(eq(suggestedQuestions.notebookId, notebookId));

	const formattedQuestions = questionsData.map((question) => ({
		...question,
		createdAt: new Date(question.createdAt),
	}));

	return NextResponse.json(formattedQuestions);
}

export const GET = withDb(getHandler);

async function postHandler(
	request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	const { notebookId } = await params;
	const body = await request.json();
	const { questions } = body;

	if (!questions || !Array.isArray(questions)) {
		return NextResponse.json(
			{ message: 'Questions array is required' },
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

	await db
		.delete(suggestedQuestions)
		.where(eq(suggestedQuestions.notebookId, notebookId));
	const now = new Date();
	// Get the user ID from the notebook
	const userId = notebook.userId;

	const questionsToInsert = questions.map((question) => ({
		id: uuidv4(),
		text: sanitizeInput(question.text),
		notebookId,
		userId,
		createdAt: now,
	}));

	if (questionsToInsert.length > 0) {
		await db.insert(suggestedQuestions).values(questionsToInsert);
	}

	const newQuestions = await db
		.select()
		.from(suggestedQuestions)
		.where(eq(suggestedQuestions.notebookId, notebookId));

	const formattedQuestions = newQuestions.map((question) => ({
		...question,
		createdAt: new Date(question.createdAt),
	}));

	return NextResponse.json(formattedQuestions, { status: 201 });
}

export const POST = withDb(postHandler);

async function deleteHandler(
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

	await db
		.delete(suggestedQuestions)
		.where(eq(suggestedQuestions.notebookId, notebookId));

	return NextResponse.json({
		message: 'All suggested questions cleared successfully',
	});
}

export const DELETE = withDb(deleteHandler);
