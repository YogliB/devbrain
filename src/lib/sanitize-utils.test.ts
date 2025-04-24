import { describe, it, expect, vi } from 'vitest';
import {
	sanitizeHtml,
	sanitizeText,
	sanitizeForDatabase,
	sanitizeFilename,
	sanitizeInput,
} from './sanitize-utils';

// Mock window for server-side testing
vi.stubGlobal('window', undefined);

describe('sanitize-utils', () => {
	describe('sanitizeHtml', () => {
		it('should remove dangerous HTML tags and attributes', () => {
			// Since we're in a server environment for tests, this will use the fallback
			const input = '<script>alert("XSS")</script><p>Hello</p>';
			const result = sanitizeHtml(input);
			expect(result).not.toContain('<script>');
		});
	});

	describe('sanitizeText', () => {
		it('should escape HTML special characters', () => {
			const input = '<p>Hello & World</p>';
			const result = sanitizeText(input);
			expect(result).toBe('&lt;p&gt;Hello &amp; World&lt;/p&gt;');
		});

		it('should handle empty input', () => {
			expect(sanitizeText('')).toBe('');
			expect(sanitizeText(null as unknown as string)).toBe('');
			expect(sanitizeText(undefined as unknown as string)).toBe('');
		});
	});

	describe('sanitizeForDatabase', () => {
		it('should escape single quotes for SQL safety', () => {
			const input = "O'Reilly; DROP TABLE users;";
			const result = sanitizeForDatabase(input);
			expect(result).toBe("O''Reilly; DROP TABLE users;");
		});

		it('should handle empty input', () => {
			expect(sanitizeForDatabase('')).toBe('');
			expect(sanitizeForDatabase(null as unknown as string)).toBe('');
			expect(sanitizeForDatabase(undefined as unknown as string)).toBe(
				'',
			);
		});
	});

	describe('sanitizeFilename', () => {
		it('should remove unsafe filename characters', () => {
			const input = '../dangerous/path/file.txt';
			const result = sanitizeFilename(input);
			expect(result).toBe('..dangerouspathfile.txt');
		});

		it('should handle empty input', () => {
			expect(sanitizeFilename('')).toBe('');
			expect(sanitizeFilename(null as unknown as string)).toBe('');
			expect(sanitizeFilename(undefined as unknown as string)).toBe('');
		});
	});

	describe('sanitizeInput', () => {
		it('should apply both database and text sanitization', () => {
			const input = "O'Reilly <script>alert('XSS')</script>";
			const result = sanitizeInput(input);
			expect(result).toBe(
				"O''Reilly &lt;script&gt;alert(''XSS'')&lt;/script&gt;",
			);
		});

		it('should escape angle brackets but preserve quotes', () => {
			const input = '<div>Test</div>';
			const result = sanitizeInput(input);
			expect(result).toBe('&lt;div&gt;Test&lt;/div&gt;');
		});

		it('should handle empty input', () => {
			expect(sanitizeInput('')).toBe('');
			expect(sanitizeInput(null as unknown as string)).toBe('');
			expect(sanitizeInput(undefined as unknown as string)).toBe('');
		});
	});
});
