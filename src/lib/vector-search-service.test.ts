import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	searchSimilarChunks,
	formatSearchResultsForContext,
} from './vector-search-service';
import { getDb } from '@/db';
import { generateEmbedding } from './embedding-utils';

// Mock dependencies
vi.mock('@/db', () => ({
	getDb: vi.fn(),
}));

vi.mock('@/db/schema', () => ({
	sourceChunks: {
		id: 'id',
		content: 'content',
		metadata: 'metadata',
		sourceId: 'sourceId',
	},
	sourceEmbeddings: {
		chunkId: 'chunkId',
		embedding: 'embedding',
		notebookId: 'notebookId',
		userId: 'userId',
	},
}));

vi.mock('./embedding-utils', () => ({
	generateEmbedding: vi.fn(),
}));

describe('vector-search-service', () => {
	const mockDb = {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		innerJoin: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		limit: vi.fn().mockResolvedValue([]),
	};

	const mockResults = [
		{
			chunkId: 'chunk-1',
			content: 'This is the first chunk of content',
			metadata: { filename: 'test1.txt' },
			sourceId: 'source-1',
			similarity: 0.85,
		},
		{
			chunkId: 'chunk-2',
			content: 'This is the second chunk of content',
			metadata: { filename: 'test2.txt' },
			sourceId: 'source-2',
			similarity: 0.75,
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
		(getDb as any).mockReturnValue(mockDb);
		(generateEmbedding as any).mockResolvedValue(
			new Float32Array(384).fill(0.1),
		);
		mockDb.limit.mockResolvedValue(mockResults);
	});

	describe('searchSimilarChunks', () => {
		it('should search for similar chunks based on a query', async () => {
			const results = await searchSimilarChunks(
				'test query',
				'notebook-123',
				'user-123',
			);

			// Check that embedding was generated
			expect(generateEmbedding).toHaveBeenCalledWith('test query');

			// Check that database query was constructed correctly
			expect(mockDb.select).toHaveBeenCalled();
			expect(mockDb.from).toHaveBeenCalled();
			expect(mockDb.innerJoin).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalled();
			expect(mockDb.orderBy).toHaveBeenCalled();
			expect(mockDb.limit).toHaveBeenCalled();

			// Check that results were filtered and returned
			expect(results).toEqual(mockResults);
		});

		it('should filter results by similarity threshold', async () => {
			// Mock results with one below threshold
			const mixedResults = [
				...mockResults,
				{
					chunkId: 'chunk-3',
					content: 'This is a low similarity chunk',
					metadata: { filename: 'test3.txt' },
					sourceId: 'source-3',
					similarity: 0.5, // Below threshold
				},
			];
			mockDb.limit.mockResolvedValue(mixedResults);

			const results = await searchSimilarChunks(
				'test query',
				'notebook-123',
				'user-123',
			);

			// Should only include results above threshold
			expect(results.length).toBe(2);
			expect(results.every((r) => r.similarity >= 0.7)).toBe(true);
		});
	});

	describe('formatSearchResultsForContext', () => {
		it('should format search results into a context string', () => {
			const context = formatSearchResultsForContext(mockResults);

			// Check that the context includes the content and metadata
			expect(context).toContain('test1.txt');
			expect(context).toContain('test2.txt');
			expect(context).toContain('This is the first chunk of content');
			expect(context).toContain('This is the second chunk of content');
			expect(context).toContain('Similarity: 0.85');
			expect(context).toContain('Similarity: 0.75');
		});

		it('should return an empty string for empty results', () => {
			const context = formatSearchResultsForContext([]);
			expect(context).toBe('');
		});
	});
});
