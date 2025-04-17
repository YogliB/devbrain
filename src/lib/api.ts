import { Notebook } from '@/types/notebook';
import { Source } from '@/types/source';
import { ChatMessage } from '@/types/chat';
import { Model } from '@/types/model';

const API_URL = '/api';

async function fetchAPI<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const res = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(
			error.message || 'An error occurred while fetching the data.',
		);
	}

	return res.json();
}

export async function initializeDatabase(): Promise<{
	success: boolean;
	message: string;
}> {
	return fetchAPI('/db/init');
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

export const modelsAPI = {
	getAll: (): Promise<Model[]> => fetchAPI('/models'),

	get: (id: string): Promise<Model> => fetchAPI(`/models/${id}`),

	updateDownloadStatus: (id: string, isDownloaded: boolean): Promise<Model> =>
		fetchAPI(`/models/${id}`, {
			method: 'PATCH',
			body: JSON.stringify({ isDownloaded }),
		}),
};
