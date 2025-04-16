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
    const { notebookId } = params;
    const db = getDb();
    
    // Check if notebook exists
    const notebook = db.prepare('SELECT id FROM notebooks WHERE id = ?').get(notebookId);
    
    if (!notebook) {
      db.close();
      return NextResponse.json(
        { message: 'Notebook not found' },
        { status: 404 }
      );
    }
    
    const messages = db.prepare(`
      SELECT id, content, role, notebook_id as notebookId, timestamp
      FROM messages
      WHERE notebook_id = ?
      ORDER BY timestamp ASC
    `).all(notebookId);
    
    // Convert timestamps to Date objects
    const formattedMessages = messages.map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp * 1000),
    }));
    
    db.close();
    
    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error(`Error fetching messages for notebook ${params.notebookId}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch messages', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { notebookId: string } }
) {
  try {
    const { notebookId } = params;
    const body = await request.json();
    const { content, role } = body;
    
    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }
    
    if (!role || !['user', 'assistant'].includes(role)) {
      return NextResponse.json(
        { message: 'Role must be either "user" or "assistant"' },
        { status: 400 }
      );
    }
    
    const db = getDb();
    
    // Check if notebook exists
    const notebook = db.prepare('SELECT id FROM notebooks WHERE id = ?').get(notebookId);
    
    if (!notebook) {
      db.close();
      return NextResponse.json(
        { message: 'Notebook not found' },
        { status: 404 }
      );
    }
    
    const id = `${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);
    
    db.prepare(`
      INSERT INTO messages (id, content, role, notebook_id, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, content, role, notebookId, now);
    
    const message = db.prepare(`
      SELECT id, content, role, notebook_id as notebookId, timestamp
      FROM messages
      WHERE id = ?
    `).get(id);
    
    // Convert timestamp to Date object
    const formattedMessage = {
      ...message,
      timestamp: new Date(message.timestamp * 1000),
    };
    
    // Update notebook's updated_at timestamp
    db.prepare(`
      UPDATE notebooks
      SET updated_at = ?
      WHERE id = ?
    `).run(now, notebookId);
    
    db.close();
    
    return NextResponse.json(formattedMessage, { status: 201 });
  } catch (error) {
    console.error(`Error creating message for notebook ${params.notebookId}:`, error);
    return NextResponse.json(
      { message: 'Failed to create message', error: String(error) },
      { status: 500 }
    );
  }
}
