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
  { params }: { params: { notebookId: string; id: string } }
) {
  try {
    const { notebookId, id } = params;
    const db = getDb();
    
    const source = db.prepare(`
      SELECT id, content, filename, tag, notebook_id as notebookId, created_at as createdAt
      FROM sources
      WHERE id = ? AND notebook_id = ?
    `).get(id, notebookId);
    
    if (!source) {
      db.close();
      return NextResponse.json(
        { message: 'Source not found' },
        { status: 404 }
      );
    }
    
    // Convert timestamp to Date object
    const formattedSource = {
      ...source,
      createdAt: new Date(source.createdAt * 1000),
    };
    
    db.close();
    
    return NextResponse.json(formattedSource);
  } catch (error) {
    console.error(`Error fetching source ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch source', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { notebookId: string; id: string } }
) {
  try {
    const { notebookId, id } = params;
    const body = await request.json();
    const { content, filename, tag } = body;
    
    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }
    
    const db = getDb();
    
    // Check if source exists
    const existingSource = db.prepare(
      'SELECT id FROM sources WHERE id = ? AND notebook_id = ?'
    ).get(id, notebookId);
    
    if (!existingSource) {
      db.close();
      return NextResponse.json(
        { message: 'Source not found' },
        { status: 404 }
      );
    }
    
    const now = Math.floor(Date.now() / 1000);
    
    db.prepare(`
      UPDATE sources
      SET content = ?, filename = ?, tag = ?
      WHERE id = ? AND notebook_id = ?
    `).run(content, filename || null, tag || null, id, notebookId);
    
    const updatedSource = db.prepare(`
      SELECT id, content, filename, tag, notebook_id as notebookId, created_at as createdAt
      FROM sources
      WHERE id = ?
    `).get(id);
    
    // Convert timestamp to Date object
    const formattedSource = {
      ...updatedSource,
      createdAt: new Date(updatedSource.createdAt * 1000),
    };
    
    // Update notebook's updated_at timestamp
    db.prepare(`
      UPDATE notebooks
      SET updated_at = ?
      WHERE id = ?
    `).run(now, notebookId);
    
    db.close();
    
    return NextResponse.json(formattedSource);
  } catch (error) {
    console.error(`Error updating source ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update source', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { notebookId: string; id: string } }
) {
  try {
    const { notebookId, id } = params;
    const db = getDb();
    
    // Check if source exists
    const existingSource = db.prepare(
      'SELECT id FROM sources WHERE id = ? AND notebook_id = ?'
    ).get(id, notebookId);
    
    if (!existingSource) {
      db.close();
      return NextResponse.json(
        { message: 'Source not found' },
        { status: 404 }
      );
    }
    
    // Delete the source
    db.prepare('DELETE FROM sources WHERE id = ? AND notebook_id = ?').run(id, notebookId);
    
    // Update notebook's updated_at timestamp
    const now = Math.floor(Date.now() / 1000);
    db.prepare(`
      UPDATE notebooks
      SET updated_at = ?
      WHERE id = ?
    `).run(now, notebookId);
    
    db.close();
    
    return NextResponse.json({ message: 'Source deleted successfully' });
  } catch (error) {
    console.error(`Error deleting source ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete source', error: String(error) },
      { status: 500 }
    );
  }
}
