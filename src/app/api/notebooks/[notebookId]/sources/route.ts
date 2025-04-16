import { NextRequest, NextResponse } from 'next/server';
import { getDb, closeDb } from '@/db';
import { notebooks, sources } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  _request: NextRequest,
  { params }: { params: { notebookId: string } }
) {
  try {
    const { notebookId } = params;
    const db = getDb();

    // Check if notebook exists
    const [notebook] = await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.id, notebookId));

    if (!notebook) {
      return NextResponse.json(
        { message: 'Notebook not found' },
        { status: 404 }
      );
    }

    // Get sources for the notebook
    const sourcesData = await db
      .select()
      .from(sources)
      .where(eq(sources.notebookId, notebookId))
      .orderBy(desc(sources.createdAt));

    // Format dates for JSON response
    const formattedSources = sourcesData.map((source) => ({
      ...source,
      createdAt: new Date(source.createdAt),
    }));

    return NextResponse.json(formattedSources);
  } catch (error) {
    console.error(`Error fetching sources for notebook ${params.notebookId}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch sources', error: String(error) },
      { status: 500 }
    );
  } finally {
    closeDb();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { notebookId: string } }
) {
  try {
    const { notebookId } = params;
    const body = await request.json();
    const { content, filename, tag } = body;

    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if notebook exists
    const [notebook] = await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.id, notebookId));

    if (!notebook) {
      return NextResponse.json(
        { message: 'Notebook not found' },
        { status: 404 }
      );
    }

    const id = uuidv4();
    const now = new Date();

    // Insert the new source
    await db.insert(sources).values({
      id,
      content,
      filename: filename || null,
      tag: tag || null,
      notebookId,
      createdAt: now,
    });

    // Get the inserted source
    const [newSource] = await db
      .select()
      .from(sources)
      .where(eq(sources.id, id));

    // Format dates for JSON response
    const formattedSource = {
      ...newSource,
      createdAt: new Date(newSource.createdAt),
    };

    // Update notebook's updated_at timestamp
    await db
      .update(notebooks)
      .set({ updatedAt: now })
      .where(eq(notebooks.id, notebookId));

    return NextResponse.json(formattedSource, { status: 201 });
  } catch (error) {
    console.error(`Error creating source for notebook ${params.notebookId}:`, error);
    return NextResponse.json(
      { message: 'Failed to create source', error: String(error) },
      { status: 500 }
    );
  } finally {
    closeDb();
  }
}
