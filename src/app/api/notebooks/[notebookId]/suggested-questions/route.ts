import { NextRequest, NextResponse } from 'next/server';
import { getDb, closeDb } from '@/db';
import { notebooks, suggestedQuestions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	try {
		const { notebookId } = await params;
		const db = getDb();

		const [notebook] = await db
			.select()
			.from(notebooks)
			.where(eq(notebooks.id, notebookId));

		if (!notebook) {
			closeDb();
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

		closeDb();

		return NextResponse.json(formattedQuestions);
	} catch (error) {
		const { notebookId } = await params;
		console.error(
			`Error fetching suggested questions for notebook ${notebookId}:`,
			error,
		);
		return NextResponse.json(
			{
				message: 'Failed to fetch suggested questions',
				error: String(error),
			},
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	try {
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
			closeDb();
			return NextResponse.json(
				{ message: 'Notebook not found' },
				{ status: 404 },
			);
		}

		await db
			.delete(suggestedQuestions)
			.where(eq(suggestedQuestions.notebookId, notebookId));
		const now = new Date();
		const questionsToInsert = questions.map((question) => ({
			id: uuidv4(),
			text: question.text,
			notebookId,
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

		closeDb();

		return NextResponse.json(formattedQuestions, { status: 201 });
	} catch (error) {
		const { notebookId } = await params;
		console.error(
			`Error saving suggested questions for notebook ${notebookId}:`,
			error,
		);
		return NextResponse.json(
			{
				message: 'Failed to save suggested questions',
				error: String(error),
			},
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ notebookId: string }> },
) {
	try {
		const { notebookId } = await params;
		const db = getDb();

		const [notebook] = await db
			.select()
			.from(notebooks)
			.where(eq(notebooks.id, notebookId));

		if (!notebook) {
			closeDb();
			return NextResponse.json(
				{ message: 'Notebook not found' },
				{ status: 404 },
			);
		}

		await db
			.delete(suggestedQuestions)
			.where(eq(suggestedQuestions.notebookId, notebookId));

		closeDb();

		return NextResponse.json({
			message: 'All suggested questions cleared successfully',
		});
	} catch (error) {
		const { notebookId } = await params;
		console.error(
			`Error clearing suggested questions for notebook ${notebookId}:`,
			error,
		);
		return NextResponse.json(
			{
				message: 'Failed to clear suggested questions',
				error: String(error),
			},
			{ status: 500 },
		);
	} finally {
		closeDb();
	}
}
