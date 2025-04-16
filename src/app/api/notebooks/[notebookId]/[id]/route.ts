import { NextRequest, NextResponse } from 'next/server';
import { getDb, closeDb } from '@/db';
import { notebooks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: { notebookId: string } }
) {
  try {
    const { notebookId } = params;
    const db = getDb();

    // Get the notebook by ID
    const [notebook] = await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.id, notebookId));

    if (!notebook) {
      closeDb();
      return NextResponse.json(
        { message: 'Notebook not found' },
        { status: 404 }
      );
    }

    // Format dates for JSON response
    const formattedNotebook = {
      ...notebook,
      createdAt: new Date(notebook.createdAt),
      updatedAt: new Date(notebook.updatedAt),
    };

    closeDb();

    return NextResponse.json(formattedNotebook);
  } catch (error) {
    console.error(`Error fetching notebook ${params.notebookId}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch notebook', error: String(error) },
      { status: 500 }
    );
  } finally {
    closeDb();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { notebookId: string } }
) {
  try {
    const { notebookId } = params;
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if notebook exists
    const [existingNotebook] = await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.id, notebookId));

    if (!existingNotebook) {
      closeDb();
      return NextResponse.json(
        { message: 'Notebook not found' },
        { status: 404 }
      );
    }

    const now = new Date();

    // Update the notebook
    await db
      .update(notebooks)
      .set({
        title,
        updatedAt: now
      })
      .where(eq(notebooks.id, notebookId));

    // Get the updated notebook
    const [updatedNotebook] = await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.id, notebookId));

    // Format dates for JSON response
    const formattedNotebook = {
      ...updatedNotebook,
      createdAt: new Date(updatedNotebook.createdAt),
      updatedAt: new Date(updatedNotebook.updatedAt),
    };

    return NextResponse.json(formattedNotebook);
  } catch (error) {
    console.error(`Error updating notebook ${params.notebookId}:`, error);
    return NextResponse.json(
      { message: 'Failed to update notebook', error: String(error) },
      { status: 500 }
    );
  } finally {
    closeDb();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { notebookId: string } }
) {
  try {
    const { notebookId } = params;
    const db = getDb();

    // Check if notebook exists
    const [existingNotebook] = await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.id, notebookId));

    if (!existingNotebook) {
      closeDb();
      return NextResponse.json(
        { message: 'Notebook not found' },
        { status: 404 }
      );
    }

    // Delete the notebook (cascade will delete related sources and messages)
    await db
      .delete(notebooks)
      .where(eq(notebooks.id, notebookId));

    return NextResponse.json({ message: 'Notebook deleted successfully' });
  } catch (error) {
    console.error(`Error deleting notebook ${params.notebookId}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete notebook', error: String(error) },
      { status: 500 }
    );
  } finally {
    closeDb();
  }
}
