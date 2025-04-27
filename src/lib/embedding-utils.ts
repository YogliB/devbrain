/**
 * Utility functions for generating embeddings from text
 * Uses HuggingFace Transformers.js for CPU-compatible embedding generation
 */

import { pipeline } from '@huggingface/transformers';

// Define the embedding model to use
// MiniLM is a good balance of quality and performance for CPU-only environments
const DEFAULT_MODEL = 'Xenova/all-MiniLM-L6-v2';

// Singleton instance of the embedding pipeline
let embeddingPipeline: unknown = null;

// Define a type for the embedding pipeline
interface FeatureExtractionPipeline {
	(
		text: string | string[],
		options?: { pooling?: string; normalize?: boolean },
	): Promise<Float32Array | Float32Array[]>;
}

/**
 * Initialize the embedding pipeline
 * @param modelName The name of the model to use for embeddings
 * @returns The embedding pipeline
 */
export async function initEmbeddingPipeline(
	modelName: string = DEFAULT_MODEL,
): Promise<FeatureExtractionPipeline> {
	if (!embeddingPipeline) {
		// Create a feature extraction pipeline
		embeddingPipeline = await pipeline('feature-extraction', modelName, {
			dtype: 'fp32', // Use full precision for better accuracy
		});
	}
	return embeddingPipeline as FeatureExtractionPipeline;
}

/**
 * Generate an embedding for a text string
 * @param text The text to embed
 * @param modelName The name of the model to use (defaults to MiniLM)
 * @returns A vector embedding as a Float32Array
 */
export async function generateEmbedding(
	text: string,
	modelName: string = DEFAULT_MODEL,
): Promise<Float32Array> {
	// Initialize the pipeline if not already done
	const featurePipeline = await initEmbeddingPipeline(modelName);

	// Generate embeddings
	const result = await featurePipeline(text, {
		pooling: 'mean',
		normalize: true,
	});

	// Return the embedding vector
	return result as Float32Array;
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts Array of texts to embed
 * @param modelName The name of the model to use
 * @param batchSize Maximum number of texts to process at once
 * @returns Array of vector embeddings
 */
export async function generateEmbeddingsBatch(
	texts: string[],
	modelName: string = DEFAULT_MODEL,
	batchSize: number = 8,
): Promise<Float32Array[]> {
	// Initialize the pipeline
	const featurePipeline = await initEmbeddingPipeline(modelName);

	const embeddings: Float32Array[] = [];

	// Process in batches to avoid memory issues
	for (let i = 0; i < texts.length; i += batchSize) {
		const batch = texts.slice(i, i + batchSize);

		// Generate embeddings for the batch
		const results = await featurePipeline(batch, {
			pooling: 'mean',
			normalize: true,
		});

		// Add the embeddings to our array
		if (Array.isArray(results)) {
			embeddings.push(...results);
		} else {
			// If only one result is returned (when batch has one item)
			embeddings.push(results);
		}
	}

	return embeddings;
}

/**
 * Calculate the cosine similarity between two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Similarity score between -1 and 1
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
	if (a.length !== b.length) {
		throw new Error('Vectors must have the same dimensions');
	}

	let dotProduct = 0;
	let normA = 0;
	let normB = 0;

	for (let i = 0; i < a.length; i++) {
		dotProduct += a[i] * b[i];
		normA += a[i] * a[i];
		normB += b[i] * b[i];
	}

	return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
