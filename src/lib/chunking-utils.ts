/**
 * Utility functions for chunking text content
 */

export interface TextChunk {
	content: string;
	index: number;
	metadata?: Record<string, unknown>;
}

/**
 * Splits text into chunks of approximately the specified size
 * Uses a sliding window approach with overlap to ensure context is preserved
 *
 * @param text The text to chunk
 * @param chunkSize The target size of each chunk in characters
 * @param chunkOverlap The number of characters to overlap between chunks
 * @param metadata Optional metadata to include with each chunk
 * @returns An array of text chunks
 */
export function chunkText(
	text: string,
	chunkSize = 1000,
	chunkOverlap = 200,
	metadata?: Record<string, unknown>,
): TextChunk[] {
	if (!text || text.trim().length === 0) {
		return [];
	}

	// Ensure overlap is smaller than chunk size
	const overlap = Math.min(chunkOverlap, chunkSize - 100);

	// Split text into paragraphs
	const paragraphs = text
		.split(/\n+/)
		.map((p) => p.trim())
		.filter((p) => p.length > 0);

	const chunks: TextChunk[] = [];
	let currentChunk = '';
	let chunkIndex = 0;

	for (const paragraph of paragraphs) {
		// If adding this paragraph would exceed the chunk size, create a new chunk
		if (
			currentChunk.length + paragraph.length + 1 > chunkSize &&
			currentChunk.length > 0
		) {
			chunks.push({
				content: currentChunk.trim(),
				index: chunkIndex,
				metadata,
			});

			// Start a new chunk with overlap from the previous chunk
			const words = currentChunk.split(' ');
			const overlapWords = words.slice(
				Math.max(0, words.length - overlap / 5),
			); // Approximate words in overlap
			currentChunk = overlapWords.join(' ') + '\n' + paragraph;
			chunkIndex++;
		} else {
			// Add paragraph to current chunk
			currentChunk += (currentChunk.length > 0 ? '\n' : '') + paragraph;
		}
	}

	// Add the final chunk if it's not empty
	if (currentChunk.trim().length > 0) {
		chunks.push({
			content: currentChunk.trim(),
			index: chunkIndex,
			metadata,
		});
	}

	return chunks;
}

/**
 * Splits text into chunks based on a maximum token count
 * This is more accurate for LLM processing but requires a tokenizer
 *
 * @param text The text to chunk
 * @param maxTokens The maximum number of tokens per chunk
 * @param overlapTokens The number of tokens to overlap between chunks
 * @param metadata Optional metadata to include with each chunk
 * @returns An array of text chunks
 */
export function chunkTextByTokens(
	text: string,
	maxTokens = 500,
	overlapTokens = 100,
	metadata?: Record<string, unknown>,
): TextChunk[] {
	// For now, we'll use a simple approximation of 4 characters per token
	// This is a rough estimate and should be replaced with a proper tokenizer
	const chunkSize = maxTokens * 4;
	const chunkOverlap = overlapTokens * 4;

	return chunkText(text, chunkSize, chunkOverlap, metadata);
}

/**
 * Recursively chunks text to ensure no chunk exceeds the maximum size
 * Useful for very long documents
 *
 * @param text The text to chunk
 * @param maxChunkSize The maximum size of each chunk in characters
 * @param metadata Optional metadata to include with each chunk
 * @returns An array of text chunks
 */
export function recursiveChunking(
	text: string,
	maxChunkSize = 2000,
	metadata?: Record<string, unknown>,
): TextChunk[] {
	const initialChunks = chunkText(
		text,
		maxChunkSize,
		Math.floor(maxChunkSize * 0.1),
		metadata,
	);

	// Check if any chunks are still too large and recursively chunk them
	const finalChunks: TextChunk[] = [];
	let globalIndex = 0;

	for (const chunk of initialChunks) {
		if (chunk.content.length > maxChunkSize) {
			// Recursively chunk this large chunk
			const subChunks = recursiveChunking(chunk.content, maxChunkSize, {
				...chunk.metadata,
				parentIndex: chunk.index,
			});

			// Update indices and add to final chunks
			subChunks.forEach((subChunk) => {
				finalChunks.push({
					...subChunk,
					index: globalIndex++,
				});
			});
		} else {
			finalChunks.push({
				...chunk,
				index: globalIndex++,
			});
		}
	}

	return finalChunks;
}
