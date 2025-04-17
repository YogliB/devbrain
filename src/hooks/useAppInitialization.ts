import { useState, useEffect, useCallback } from 'react';
import {
	initializeDatabase,
	notebooksAPI,
	messagesAPI,
	sourcesAPI,
} from '@/lib/api';
import { Notebook } from '@/types/notebook';
import { Source } from '@/types/source';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { useModel } from '@/contexts/model-context';

export function useAppInitialization() {
	const [isLoading, setIsLoading] = useState(true);
	const [notebooks, setNotebooks] = useState<Notebook[]>([]);
	const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [sources, setSources] = useState<Source[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);

	// Get model information from context
	const { selectedModel, isModelDownloaded } = useModel();

	const fetchNotebooks = useCallback(async () => {
		try {
			const notebooksData = await notebooksAPI.getAll();
			setNotebooks(notebooksData);
			return notebooksData;
		} catch (error) {
			console.error('Failed to fetch notebooks:', error);
			return [];
		}
	}, []);

	const selectNotebook = useCallback((notebook: Notebook) => {
		setActiveNotebook(notebook);
	}, []);

	const createNotebook = useCallback(async () => {
		try {
			const newNotebook = await notebooksAPI.create(
				`New Notebook ${notebooks.length + 1}`,
			);
			setNotebooks((prev) => [...prev, newNotebook]);
			setActiveNotebook(newNotebook);
			return newNotebook;
		} catch (error) {
			console.error('Failed to create notebook:', error);
			return null;
		}
	}, [notebooks.length]);

	const deleteNotebook = useCallback(
		async (notebook: Notebook) => {
			try {
				await notebooksAPI.delete(notebook.id);
				const updatedNotebooks = notebooks.filter(
					(n) => n.id !== notebook.id,
				);
				setNotebooks(updatedNotebooks);

				if (activeNotebook?.id === notebook.id) {
					setActiveNotebook(updatedNotebooks[0] || null);
				}
				return true;
			} catch (error) {
				console.error('Failed to delete notebook:', error);
				return false;
			}
		},
		[notebooks, activeNotebook],
	);

	// Message functions
	const fetchMessages = useCallback(async (notebookId: string) => {
		if (!notebookId) return [];

		try {
			const messagesData = await messagesAPI.getAll(notebookId);
			setMessages(messagesData);
			return messagesData;
		} catch (error) {
			console.error('Failed to fetch messages:', error);
			return [];
		}
	}, []);

	const sendMessage = useCallback(
		async (content: string) => {
			if (!activeNotebook) return null;
			if (!selectedModel) return null;
			if (!isModelDownloaded(selectedModel.id)) return null;

			try {
				// Create and save user message
				const userMessage = await messagesAPI.create(
					activeNotebook.id,
					content,
					'user',
				);
				setMessages((prev) => [...prev, userMessage]);

				// Generate AI response
				setIsGenerating(true);
				try {
					// Placeholder for AI response - will be implemented with new service
					const aiResponse = `This is a placeholder response. The AI model integration is being reimplemented.\n\nYour message was: "${content}"\n\nSources: ${sources.length} source(s) available.`;

					// Save the AI response to the database
					const assistantMessage = await messagesAPI.create(
						activeNotebook.id,
						aiResponse,
						'assistant',
					);

					setMessages((prev) => [...prev, assistantMessage]);
				} catch (error) {
					console.error('Failed to generate AI response:', error);

					// Create an error message
					const errorMessage = await messagesAPI.create(
						activeNotebook.id,
						`Error generating response: ${error instanceof Error ? error.message : String(error)}`,
						'assistant',
					);

					setMessages((prev) => [...prev, errorMessage]);
				} finally {
					setIsGenerating(false);
				}

				return userMessage;
			} catch (error) {
				console.error('Failed to send message:', error);
				return null;
			}
		},
		[activeNotebook, selectedModel, isModelDownloaded],
	);

	const selectQuestion = useCallback(
		(question: SuggestedQuestion) => sendMessage(question.text),
		[sendMessage],
	);

	const clearMessages = useCallback(async () => {
		if (!activeNotebook) return false;

		try {
			await messagesAPI.clear(activeNotebook.id);
			setMessages([]);
			return true;
		} catch (error) {
			console.error('Failed to clear messages:', error);
			return false;
		}
	}, [activeNotebook]);

	// Source functions
	const fetchSources = useCallback(async (notebookId: string) => {
		if (!notebookId) return [];

		try {
			const sourcesData = await sourcesAPI.getAll(notebookId);
			setSources(sourcesData);
			return sourcesData;
		} catch (error) {
			console.error('Failed to fetch sources:', error);
			return [];
		}
	}, []);

	const addSource = useCallback(
		async (content: string, filename?: string) => {
			if (!activeNotebook) return null;

			try {
				const newSource = await sourcesAPI.create(
					activeNotebook.id,
					content,
					filename,
				);
				setSources((prev) => [...prev, newSource]);
				return newSource;
			} catch (error) {
				console.error('Failed to add source:', error);
				return null;
			}
		},
		[activeNotebook],
	);

	const updateSource = useCallback(
		async (source: Source, content: string) => {
			if (!activeNotebook) return null;

			try {
				const updatedSource = await sourcesAPI.update(
					activeNotebook.id,
					source.id,
					content,
					source.filename,
				);

				setSources((prev) =>
					prev.map((s) =>
						s.id === updatedSource.id ? updatedSource : s,
					),
				);
				return updatedSource;
			} catch (error) {
				console.error('Failed to update source:', error);
				return null;
			}
		},
		[activeNotebook],
	);

	const deleteSource = useCallback(
		async (source: Source) => {
			if (!activeNotebook) return false;

			try {
				await sourcesAPI.delete(activeNotebook.id, source.id);
				setSources((prev) => prev.filter((s) => s.id !== source.id));
				return true;
			} catch (error) {
				console.error('Failed to delete source:', error);
				return false;
			}
		},
		[activeNotebook],
	);

	useEffect(() => {
		async function initializeApp() {
			try {
				const timeoutPromise = new Promise<void>((resolve) => {
					setTimeout(resolve, 2000);
				});

				initializeDatabase().catch((error) => {
					console.error('Database initialization issue:', error);
				});

				await timeoutPromise;

				const notebooksData = await fetchNotebooks();

				if (notebooksData.length > 0) {
					const notebook = notebooksData[0];
					setActiveNotebook(notebook);

					await Promise.all([
						fetchSources(notebook.id),
						fetchMessages(notebook.id),
					]);
				}

				// Models are now handled by the model context
			} catch (error) {
				console.error('Failed to initialize app:', error);
			} finally {
				setIsLoading(false);
			}
		}

		initializeApp();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!activeNotebook) return;

		const notebookId = activeNotebook.id;

		async function loadNotebookData() {
			try {
				await Promise.all([
					fetchSources(notebookId),
					fetchMessages(notebookId),
				]);
			} catch (error) {
				console.error('Failed to load notebook data:', error);
			}
		}

		loadNotebookData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeNotebook]);

	return {
		isLoading,
		notebooks,
		activeNotebook,
		messages,
		sources,
		isGenerating,

		selectNotebook,
		createNotebook,
		deleteNotebook,

		sendMessage,
		selectQuestion,
		clearMessages,

		addSource,
		updateSource,
		deleteSource,
	};
}
