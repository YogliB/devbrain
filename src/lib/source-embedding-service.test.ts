import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	processSource,
	deleteSourceChunks,
	updateSourceChunks,
} from './source-embedding-service';
import { getDb } from '@/db';
import { chunkText } from './chunking-utils';
import { generateEmbedding } from './embedding-utils';

// Mock dependencies
vi.mock('@/db', () => ({
	getDb: vi.fn(),
}));

vi.mock('./chunking-utils', () => ({
	chunkText: vi.fn(),
}));

vi.mock('./embedding-utils', () => ({
	generateEmbedding: vi.fn(),
}));

vi.mock('uuid', () => ({
	v4: () => 'test-uuid',
}));

describe('source-embedding-service', () => {
	const mockDb = {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockResolvedValue(undefined),
		delete: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
	};

	const mockSource = {
		id: 'source-123',
		content: 'Test content for embedding',
		notebookId: 'notebook-123',
		userId: 'user-123',
		filename: 'test.txt',
		tag: 'test',
		createdAt: new Date(),
	};

	const mockChunks = [
		{
			content: 'Chunk 1 content',
			index: 0,
			metadata: { sourceId: 'source-123' },
		},
		{
			content: 'Chunk 2 content',
			index: 1,
			metadata: { sourceId: 'source-123' },
		},
	];

	const mockEmbedding = new Float32Array([0.1, 0.2, 0.3]);

	beforeEach(() => {
		vi.clearAllMocks();

		// Setup mocks
		(getDb as unknown).mockReturnValue(mockDb);
		mockDb.where.mockResolvedValue([mockSource]);
		(chunkText as unknown).mockReturnValue(mockChunks);
		(generateEmbedding as unknown).mockResolvedValue(mockEmbedding);
	});

	describe('processSource', () => {
		it('should process a source into chunks and embeddings', async () => {
			await processSource('source-123', 'user-123');

			// Check that the source was retrieved
			expect(mockDb.select).toHaveBeenCalled();
			expect(mockDb.from).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalled();

			// Check that chunking was performed
			expect(chunkText).toHaveBeenCalledWith(
				mockSource.content,
				expect.any(Number),
				expect.any(Number),
				expect.objectContaining({
					sourceId: mockSource.id,
				}),
			);

			// Check that embeddings were generated
			expect(generateEmbedding).toHaveBeenCalledTimes(mockChunks.length);

			// Check that chunks and embeddings were inserted
			expect(mockDb.insert).toHaveBeenCalledTimes(2);
			expect(mockDb.values).toHaveBeenCalledTimes(2);
		});

		it('should return the number of chunks created', async () => {
			const result = await processSource('source-123', 'user-123');
			expect(result).toBe(mockChunks.length);
		});

		it('should handle empty content gracefully', async () => {
			(chunkText as unknown).mockReturnValue([]);
			const result = await processSource('source-123', 'user-123');
			expect(result).toBe(0);
			expect(mockDb.insert).not.toHaveBeenCalled();
		});
	});

	describe('deleteSourceChunks', () => {
		it('should delete chunks for a source', async () => {
			await deleteSourceChunks('source-123', 'user-123');

			expect(mockDb.delete).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalled();
		});
	});

	describe('updateSourceChunks', () => {
		it('should delete existing chunks and create new ones', async () => {
			await updateSourceChunks('source-123', 'user-123');

			// Should call delete first
			expect(mockDb.delete).toHaveBeenCalled();

			// Then should process the source again
			expect(chunkText).toHaveBeenCalled();
			expect(generateEmbedding).toHaveBeenCalled();
			expect(mockDb.insert).toHaveBeenCalled();
		});
	});
});
