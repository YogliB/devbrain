/**
 * Service for handling source chunking and embedding
 */

import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/db';
import { sources, sourceChunks, sourceEmbeddings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { chunkText } from './chunking-utils';
import { generateEmbedding } from './embedding-utils';

// Configuration
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

/**
 * Process a source by chunking its content and generating embeddings
 *
 * @param sourceId The ID of the source to process
 * @param userId The ID of the user who owns the source
 * @returns The number of chunks created
 */
export async function processSource(
	sourceId: string,
	userId: string,
): Promise<number> {
	const db = getDb();

	// Get the source
	const [source] = await db
		.select()
		.from(sources)
		.where(and(eq(sources.id, sourceId), eq(sources.userId, userId)));

	if (!source) {
		throw new Error('Source not found');
	}

	// Create metadata for the chunks
	const metadata = {
		sourceId: source.id,
		filename: source.filename || undefined,
		tag: source.tag || undefined,
	};

	// Chunk the source content
	const chunks = chunkText(
		source.content,
		CHUNK_SIZE,
		CHUNK_OVERLAP,
		metadata,
	);

	// If no chunks were created, return early
	if (chunks.length === 0) {
		return 0;
	}

	// Process each chunk and generate embeddings
	const now = new Date();

	// Create batch operations for better performance
	const chunkInserts = [];
	const embeddingInserts = [];

	for (const chunk of chunks) {
		const chunkId = uuidv4();

		// Prepare chunk insert
		chunkInserts.push({
			id: chunkId,
			content: chunk.content,
			chunkIndex: chunk.index,
			metadata: chunk.metadata,
			sourceId: source.id,
			notebookId: source.notebookId,
			userId: source.userId,
			createdAt: now,
		});

		// Generate embedding for the chunk
		const embedding = await generateEmbedding(chunk.content);

		// Convert Float32Array to regular array for Drizzle's vector type
		const embeddingArray = Array.from(embedding);

		// Prepare embedding insert
		embeddingInserts.push({
			id: uuidv4(),
			chunkId,
			embedding: embeddingArray, // Using Drizzle's vector type
			sourceId: source.id,
			notebookId: source.notebookId,
			userId: source.userId,
			createdAt: now,
		});
	}

	// Insert chunks in batch
	if (chunkInserts.length > 0) {
		await db.insert(sourceChunks).values(chunkInserts);
	}

	// Insert embeddings in batch
	if (embeddingInserts.length > 0) {
		await db.insert(sourceEmbeddings).values(embeddingInserts);
	}

	return chunks.length;
}

/**
 * Delete all chunks and embeddings for a source
 *
 * @param sourceId The ID of the source
 * @param userId The ID of the user who owns the source
 */
export async function deleteSourceChunks(
	sourceId: string,
	userId: string,
): Promise<void> {
	const db = getDb();

	// Delete all chunks for the source (embeddings will be deleted via cascade)
	await db
		.delete(sourceChunks)
		.where(
			and(
				eq(sourceChunks.sourceId, sourceId),
				eq(sourceChunks.userId, userId),
			),
		);
}

/**
 * Update chunks and embeddings for a source
 * This deletes existing chunks and creates new ones
 *
 * @param sourceId The ID of the source to update
 * @param userId The ID of the user who owns the source
 * @returns The number of new chunks created
 */
export async function updateSourceChunks(
	sourceId: string,
	userId: string,
): Promise<number> {
	// Delete existing chunks
	await deleteSourceChunks(sourceId, userId);

	// Process the source again
	return processSource(sourceId, userId);
}
