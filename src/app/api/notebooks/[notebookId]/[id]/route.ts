import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { join } from 'path';

// Helper function to get database connection
function getDb() {
  const dbPath = join(process.cwd(), 'devbrain.db');
  return new Database(dbPath);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { notebookId: string } }
) {
  try {
    const { id } = params;
    const db = getDb();

    const notebook = db.prepare(`
      SELECT id, title, created_at as createdAt, updated_at as updatedAt
      FROM notebooks
      WHERE id = ?
    `).get(id);

    if (!notebook) {
      db.close();
      return NextResponse.json(
        { message: 'Notebook not found' },
        { status: 404 }
      );
    }

    // Convert timestamps to Date objects
    const formattedNotebook = {
      ...notebook,
      createdAt: new Date(notebook.createdAt * 1000),
      updatedAt: new Date(notebook.updatedAt * 1000),
    };

    db.close();

    return NextResponse.json(formattedNotebook);
  } catch (error) {
    console.error(`Error fetching notebook ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch notebook', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
    const existingNotebook = db.prepare('SELECT id FROM notebooks WHERE id = ?').get(id);

    if (!existingNotebook) {
      db.close();
      return NextResponse.json(
        { message: 'Notebook not found' },
        { status: 404 }
      );
    }

    const now = Math.floor(Date.now() / 1000);

    db.prepare(`
      UPDATE notebooks
      SET title = ?, updated_at = ?
      WHERE id = ?
    `).run(title, now, id);

    const updatedNotebook = db.prepare(`
      SELECT id, title, created_at as createdAt, updated_at as updatedAt
      FROM notebooks
      WHERE id = ?
    `).get(id);

    // Convert timestamps to Date objects
    const formattedNotebook = {
      ...updatedNotebook,
      createdAt: new Date(updatedNotebook.createdAt * 1000),
      updatedAt: new Date(updatedNotebook.updatedAt * 1000),
    };

    db.close();

    return NextResponse.json(formattedNotebook);
  } catch (error) {
    console.error(`Error updating notebook ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update notebook', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDb();

    // Check if notebook exists
    const existingNotebook = db.prepare('SELECT id FROM notebooks WHERE id = ?').get(id);

    if (!existingNotebook) {
      db.close();
      return NextResponse.json(
        { message: 'Notebook not found' },
        { status: 404 }
      );
    }

    // Delete the notebook (cascade will delete related sources and messages)
    db.prepare('DELETE FROM notebooks WHERE id = ?').run(id);

    db.close();

    return NextResponse.json({ message: 'Notebook deleted successfully' });
  } catch (error) {
    console.error(`Error deleting notebook ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete notebook', error: String(error) },
      { status: 500 }
    );
  }
}
