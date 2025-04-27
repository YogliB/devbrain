import { describe, it, expect } from 'vitest';
import {
	chunkText,
	chunkTextByTokens,
	recursiveChunking,
} from './chunking-utils';

describe('chunking-utils', () => {
	describe('chunkText', () => {
		it('should return empty array for empty text', () => {
			expect(chunkText('')).toEqual([]);
			expect(chunkText('   ')).toEqual([]);
		});

		it('should create a single chunk for text smaller than chunk size', () => {
			const text = 'This is a short text';
			const chunks = chunkText(text, 100);

			expect(chunks.length).toBe(1);
			expect(chunks[0].content).toBe(text);
			expect(chunks[0].index).toBe(0);
		});

		it('should split text into multiple chunks', () => {
			const paragraph =
				'This is a paragraph with multiple sentences. It should be long enough to test chunking. ' +
				'We want to make sure the chunking works correctly. This is some more text to make it longer.';
			const text = `${paragraph}\n\n${paragraph}\n\n${paragraph}`;

			const chunks = chunkText(text, 200, 20);

			expect(chunks.length).toBeGreaterThan(1);
			expect(chunks[0].content.length).toBeLessThanOrEqual(200);
			expect(chunks[1].content.length).toBeLessThanOrEqual(200);
		});

		it('should include metadata in chunks', () => {
			const text = 'This is a text with metadata';
			const metadata = { source: 'test', filename: 'test.txt' };
			const chunks = chunkText(text, 100, 20, metadata);

			expect(chunks[0].metadata).toEqual(metadata);
		});
	});

	describe('chunkTextByTokens', () => {
		it('should approximate token-based chunking', () => {
			const text =
				'This is a long text that should be split into multiple chunks based on token count. ' +
				'We are using a simple approximation of 4 characters per token for this test.';

			const chunks = chunkTextByTokens(text, 40, 5); // ~40 tokens per chunk

			// With 4 chars per token approximation, 40 tokens ≈ 160 chars
			expect(chunks.length).toBeGreaterThanOrEqual(1);
			expect(chunks[0].content.length).toBeLessThanOrEqual(200); // Allow some flexibility
		});
	});

	describe('recursiveChunking', () => {
		it('should recursively chunk very large texts', () => {
			// Create a large text with repeated paragraphs
			const paragraph =
				'This is a test paragraph that will be repeated multiple times to create a large text. ' +
				'We want to test the recursive chunking functionality to ensure it works correctly.';

			let largeText = '';
			for (let i = 0; i < 5; i++) {
				largeText += paragraph + '\n\n';
			}

			const maxChunkSize = 200;
			const chunks = recursiveChunking(largeText, maxChunkSize);

			expect(chunks.length).toBeGreaterThan(0);
			// Verify no chunk exceeds the max size
			chunks.forEach((chunk) => {
				expect(chunk.content.length).toBeLessThanOrEqual(maxChunkSize);
			});

			// Check that indices are sequential
			for (let i = 1; i < chunks.length; i++) {
				expect(chunks[i].index).toBe(chunks[i - 1].index + 1);
			}
		});
	});
});
