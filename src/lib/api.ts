import { Notebook } from '@/types/notebook';
import { Source } from '@/types/source';
import { ChatMessage } from '@/types/chat';
import { SuggestedQuestion } from '@/types/suggestedQuestion';

const API_URL = '/api';

/**
 * Get the current user ID from localStorage
 * This is used to include the user ID in API requests for RLS
 */
function getCurrentUserId(): string | null {
	if (typeof window === 'undefined') return null;

	const userJson = localStorage.getItem('devbrain-user');
	if (!userJson) return null;

	try {
		const user = JSON.parse(userJson);
		return user.id;
	} catch (error) {
		console.error('Failed to parse user from localStorage:', error);
		return null;
	}
}

async function fetchAPI<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	// Get the current user ID
	const userId = getCurrentUserId();

	// Add the user ID to the request headers
	const headers = {
		'Content-Type': 'application/json',
		...(userId ? { 'x-user-id': userId } : {}),
		...options.headers,
	};

	const res = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers,
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(
			error.message || 'An error occurred while fetching the data.',
		);
	}

	return res.json();
}

export const notebooksAPI = {
	getAll: (): Promise<Notebook[]> => fetchAPI('/notebooks'),

	get: (id: string): Promise<Notebook> => fetchAPI(`/notebooks/${id}`),

	create: (title: string): Promise<Notebook> =>
		fetchAPI('/notebooks', {
			method: 'POST',
			body: JSON.stringify({ title }),
		}),

	update: (id: string, title: string): Promise<Notebook> =>
		fetchAPI(`/notebooks/${id}`, {
			method: 'PUT',
			body: JSON.stringify({ title }),
		}),

	delete: (id: string): Promise<{ message: string }> =>
		fetchAPI(`/notebooks/${id}`, {
			method: 'DELETE',
		}),
};

export const sourcesAPI = {
	getAll: (notebookId: string): Promise<Source[]> =>
		fetchAPI(`/notebooks/${notebookId}/sources`),

	get: (notebookId: string, id: string): Promise<Source> =>
		fetchAPI(`/notebooks/${notebookId}/sources/${id}`),

	create: (
		notebookId: string,
		content: string,
		filename?: string,
		tag?: string,
	): Promise<Source> =>
		fetchAPI(`/notebooks/${notebookId}/sources`, {
			method: 'POST',
			body: JSON.stringify({ content, filename, tag }),
		}),

	update: (
		notebookId: string,
		id: string,
		content: string,
		filename?: string,
		tag?: string,
	): Promise<Source> =>
		fetchAPI(`/notebooks/${notebookId}/sources/${id}`, {
			method: 'PUT',
			body: JSON.stringify({ content, filename, tag }),
		}),

	delete: (notebookId: string, id: string): Promise<{ message: string }> =>
		fetchAPI(`/notebooks/${notebookId}/sources/${id}`, {
			method: 'DELETE',
		}),
};

export const messagesAPI = {
	getAll: (notebookId: string): Promise<ChatMessage[]> =>
		fetchAPI(`/notebooks/${notebookId}/messages`),

	create: (
		notebookId: string,
		content: string,
		role: 'user' | 'assistant',
	): Promise<ChatMessage> =>
		fetchAPI(`/notebooks/${notebookId}/messages`, {
			method: 'POST',
			body: JSON.stringify({ content, role }),
		}),

	clear: (notebookId: string): Promise<{ message: string }> =>
		fetchAPI(`/notebooks/${notebookId}/messages/clear`, {
			method: 'DELETE',
		}),
};

export const suggestedQuestionsAPI = {
	getAll: (notebookId: string): Promise<SuggestedQuestion[]> =>
		fetchAPI(`/notebooks/${notebookId}/suggested-questions`),

	save: (
		notebookId: string,
		questions: { text: string }[],
	): Promise<SuggestedQuestion[]> =>
		fetchAPI(`/notebooks/${notebookId}/suggested-questions`, {
			method: 'POST',
			body: JSON.stringify({ questions }),
		}),

	clear: (notebookId: string): Promise<{ message: string }> =>
		fetchAPI(`/notebooks/${notebookId}/suggested-questions`, {
			method: 'DELETE',
		}),
};

export interface SearchResult {
	chunkId: string;
	content: string;
	similarity: number;
	metadata: any;
	sourceId: string;
}

export const vectorSearchAPI = {
	search: (
		notebookId: string,
		query: string,
		topK?: number,
	): Promise<SearchResult[]> =>
		fetchAPI(`/notebooks/${notebookId}/vector-search`, {
			method: 'POST',
			body: JSON.stringify({ query, topK }),
		}),
};
