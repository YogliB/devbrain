import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Removes all potentially dangerous HTML, scripts, and attributes
 */
export function sanitizeHtml(content: string): string {
	if (typeof window === 'undefined') {
		// Server-side - we'll need to handle this differently
		// For now, just strip all HTML tags as a fallback
		return content.replace(/<[^>]*>?/gm, '');
	}

	// Client-side - use DOMPurify
	return DOMPurify.sanitize(content, {
		USE_PROFILES: { html: true },
		FORBID_TAGS: [
			'script',
			'style',
			'iframe',
			'frame',
			'object',
			'embed',
			'form',
		],
		FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'eval'],
	});
}

/**
 * Sanitizes plain text content
 * Escapes HTML special characters to prevent them from being interpreted as HTML
 */
export function sanitizeText(content: string): string {
	if (!content) return '';

	return content
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Sanitizes content for database storage
 * Removes any potentially harmful characters or SQL injection attempts
 */
export function sanitizeForDatabase(content: string): string {
	if (!content) return '';

	// Basic sanitization for SQL injection prevention
	// Note: This is in addition to using parameterized queries with Drizzle ORM
	return content
		.replace(/'/g, "''") // Escape single quotes
		.trim();
}

/**
 * Sanitizes a filename to ensure it's safe for storage and display
 */
export function sanitizeFilename(filename: string): string {
	if (!filename) return '';

	// Remove path traversal characters and other potentially dangerous characters
	return filename
		.replace(/[/\\?%*:|"<>]/g, '') // Remove unsafe filename characters
		.trim();
}

/**
 * Sanitizes user input from forms
 * General purpose sanitization for any user input
 */
export function sanitizeInput(input: string): string {
	if (!input) return '';

	// First sanitize for database
	const dbSafe = sanitizeForDatabase(input);

	// For the sanitizeInput function, we want to escape < and > but preserve quotes
	// This is different from sanitizeText which escapes all HTML special chars
	return dbSafe.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
