/**
 * Service for searching vector embeddings
 */

import { getDb } from '@/db';
import { sourceChunks, sourceEmbeddings } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateEmbedding } from './embedding-utils';

// Configuration
const DEFAULT_TOP_K = 5;
const SIMILARITY_THRESHOLD = 0.7;

export interface SearchResult {
	chunkId: string;
	content: string;
	similarity: number;
	metadata: any;
	sourceId: string;
}

/**
 * Search for chunks similar to the query text
 *
 * @param query The query text to search for
 * @param notebookId The ID of the notebook to search in
 * @param userId The ID of the user who owns the notebook
 * @param topK The number of results to return (default: 5)
 * @returns An array of search results sorted by similarity
 */
export async function searchSimilarChunks(
	query: string,
	notebookId: string,
	userId: string,
	topK: number = DEFAULT_TOP_K,
): Promise<SearchResult[]> {
	const db = getDb();

	// Generate embedding for the query
	const queryEmbedding = await generateEmbedding(query);

	// Convert Float32Array to regular array for Drizzle's vector type
	const queryEmbeddingArray = Array.from(queryEmbedding);

	// Perform vector similarity search
	const results = await db
		.select({
			chunkId: sourceChunks.id,
			content: sourceChunks.content,
			metadata: sourceChunks.metadata,
			sourceId: sourceChunks.sourceId,
			// Calculate cosine similarity
			similarity: sql<number>`1 - (${sourceEmbeddings.embedding} <=> ${queryEmbeddingArray})`,
		})
		.from(sourceEmbeddings)
		.innerJoin(sourceChunks, eq(sourceEmbeddings.chunkId, sourceChunks.id))
		.where(
			and(
				eq(sourceEmbeddings.notebookId, notebookId),
				eq(sourceEmbeddings.userId, userId),
			),
		)
		// Order by similarity (highest first)
		.orderBy(sql`similarity DESC`)
		// Limit to top K results
		.limit(topK);

	// Filter results by similarity threshold
	return results
		.filter((result) => result.similarity >= SIMILARITY_THRESHOLD)
		.map((result) => ({
			...result,
			// Ensure metadata is properly parsed
			metadata: result.metadata ? result.metadata : {},
		}));
}

/**
 * Format search results into a context string for the AI
 *
 * @param results The search results to format
 * @returns A formatted string with the search results
 */
export function formatSearchResultsForContext(results: SearchResult[]): string {
	if (results.length === 0) {
		return '';
	}

	return results
		.map((result, index) => {
			const source = result.metadata?.filename || `Source ${index + 1}`;
			return `[${source}] (Similarity: ${result.similarity.toFixed(2)})\n${result.content}`;
		})
		.join('\n\n');
}
