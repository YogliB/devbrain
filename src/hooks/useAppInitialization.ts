import { useState, useEffect, useCallback } from 'react';
import {
	initializeDatabase,
	notebooksAPI,
	messagesAPI,
	sourcesAPI,
	modelsAPI,
} from '@/lib/api';
import { Notebook } from '@/types/notebook';
import { Source } from '@/types/source';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Model } from '@/types/model';

export function useAppInitialization() {
	const [isLoading, setIsLoading] = useState(true);
	const [notebooks, setNotebooks] = useState<Notebook[]>([]);
	const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [sources, setSources] = useState<Source[]>([]);
	const [models, setModels] = useState<Model[]>([]);
	const [selectedModel, setSelectedModel] = useState<Model | null>(null);

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

			try {
				const userMessage = await messagesAPI.create(
					activeNotebook.id,
					content,
					'user',
				);
				setMessages((prev) => [...prev, userMessage]);

				// Simulate assistant response
				setTimeout(async () => {
					try {
						const assistantMessage = await messagesAPI.create(
							activeNotebook.id,
							`I received your message: "${content}". This is a mock response.`,
							'assistant',
						);
						setMessages((prev) => [...prev, assistantMessage]);
					} catch (error) {
						console.error(
							'Failed to create assistant message:',
							error,
						);
					}
				}, 1000);

				return userMessage;
			} catch (error) {
				console.error('Failed to send message:', error);
				return null;
			}
		},
		[activeNotebook],
	);

	const selectQuestion = useCallback(
		(question: SuggestedQuestion) => sendMessage(question.text),
		[sendMessage],
	);

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

	// Model functions
	const fetchModels = useCallback(async () => {
		try {
			const modelsData = await modelsAPI.getAll();
			setModels(modelsData);

			// Set the first downloaded model as selected
			const downloadedModel = modelsData.find((m) => m.isDownloaded);
			if (downloadedModel) {
				setSelectedModel(downloadedModel);
			}

			return modelsData;
		} catch (error) {
			console.error('Failed to fetch models:', error);
			return [];
		}
	}, []);

	const selectModel = useCallback((model: Model) => {
		setSelectedModel(model);
	}, []);

	const downloadModel = useCallback(
		async (model: Model) => {
			try {
				// Update UI to show downloading state
				const updatingModels = models.map((m) =>
					m.id === model.id ? { ...m, isDownloading: true } : m,
				);
				setModels(updatingModels);

				// Simulate download delay
				await new Promise((resolve) => setTimeout(resolve, 2000));

				// Update model download status
				const updatedModel = await modelsAPI.updateDownloadStatus(
					model.id,
					true,
				);

				// Update models list with the downloaded model
				setModels((prev) =>
					prev.map((m) =>
						m.id === updatedModel.id ? updatedModel : m,
					),
				);

				// Set as selected model
				setSelectedModel(updatedModel);
				return updatedModel;
			} catch (error) {
				console.error('Failed to download model:', error);

				// Reset downloading state on error
				setModels((prev) =>
					prev.map((m) =>
						m.id === model.id ? { ...m, isDownloading: false } : m,
					),
				);
				return null;
			}
		},
		[models],
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

				await fetchModels();
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
		models,
		selectedModel,

		selectNotebook,
		createNotebook,
		deleteNotebook,

		sendMessage,
		selectQuestion,

		addSource,
		updateSource,
		deleteSource,

		selectModel,
		downloadModel,
	};
}
