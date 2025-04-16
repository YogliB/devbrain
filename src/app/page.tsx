"use client";

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/templates/main-layout';
import { Notebook } from '@/types/notebook';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Source } from '@/types/source';
import { Model } from '@/types/model';
import { initializeDatabase, notebooksAPI, sourcesAPI, messagesAPI, modelsAPI } from '@/lib/api';


const suggestedQuestions: SuggestedQuestion[] = [
	{
		id: '1',
		text: 'How do I balance a binary search tree?',
	},
	{
		id: '2',
		text: 'What\'s the time complexity of BST operations?',
	},
	{
		id: '3',
		text: 'Can you show me a tree traversal example?',
	},
];

export default function Home() {
	const [isLoading, setIsLoading] = useState(true);
	const [notebooks, setNotebooks] = useState<Notebook[]>([]);
	const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [sources, setSources] = useState<Source[]>([]);
	const [models, setModels] = useState<Model[]>([]);
	const [selectedModel, setSelectedModel] = useState<Model | null>(null);

	
	useEffect(() => {
		async function initializeApp() {
			try {
				
				await initializeDatabase();

				
				const notebooksData = await notebooksAPI.getAll();
				setNotebooks(notebooksData);

				
				if (notebooksData.length > 0) {
					const notebook = notebooksData[0];
					setActiveNotebook(notebook);

					
					const [sourcesData, messagesData] = await Promise.all([
						sourcesAPI.getAll(notebook.id),
						messagesAPI.getAll(notebook.id),
					]);

					setSources(sourcesData);
					setMessages(messagesData);
				}

				
				const modelsData = await modelsAPI.getAll();
				setModels(modelsData);

				
				const downloadedModel = modelsData.find((m) => m.isDownloaded);
				if (downloadedModel) {
					setSelectedModel(downloadedModel);
				}
			} catch (error) {
				console.error('Failed to initialize app:', error);
			} finally {
				setIsLoading(false);
			}
		}

		initializeApp();
	}, []);

	
	useEffect(() => {
		if (!activeNotebook) return;

		
		const notebookId = activeNotebook!.id;

		async function loadNotebookData() {
			try {
				const [sourcesData, messagesData] = await Promise.all([
					sourcesAPI.getAll(notebookId),
					messagesAPI.getAll(notebookId),
				]);

				setSources(sourcesData);
				setMessages(messagesData);
			} catch (error) {
				console.error('Failed to load notebook data:', error);
			}
		}

		loadNotebookData();
	}, [activeNotebook]);

	
	const handleSelectNotebook = async (notebook: Notebook) => {
		setActiveNotebook(notebook);
	};

	const handleCreateNotebook = async () => {
		try {
			const newNotebook = await notebooksAPI.create(
				`New Notebook ${notebooks.length + 1}`
			);
			setNotebooks([...notebooks, newNotebook]);
			setActiveNotebook(newNotebook);
		} catch (error) {
			console.error('Failed to create notebook:', error);
		}
	};

	const handleDeleteNotebook = async (notebook: Notebook) => {
		try {
			await notebooksAPI.delete(notebook.id);
			const updatedNotebooks = notebooks.filter((n) => n.id !== notebook.id);
			setNotebooks(updatedNotebooks);

			if (activeNotebook?.id === notebook.id) {
				setActiveNotebook(updatedNotebooks[0] || null);
			}
		} catch (error) {
			console.error('Failed to delete notebook:', error);
		}
	};

	
	const handleSendMessage = async (content: string) => {
		if (!activeNotebook) return;

		try {
			
			const userMessage = await messagesAPI.create(
				activeNotebook.id,
				content,
				'user'
			);
			setMessages((prev) => [...prev, userMessage]);

			
			setTimeout(async () => {
				try {
					const assistantMessage = await messagesAPI.create(
						activeNotebook.id,
						`I received your message: "${content}". This is a mock response.`,
						'assistant'
					);
					setMessages((prev) => [...prev, assistantMessage]);
				} catch (error) {
					console.error('Failed to create assistant message:', error);
				}
			}, 1000);
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	};

	const handleSelectQuestion = (question: SuggestedQuestion) => {
		handleSendMessage(question.text);
	};

	
	const handleAddSource = async (content: string, filename?: string) => {
		if (!activeNotebook) return;

		try {
			const newSource = await sourcesAPI.create(
				activeNotebook.id,
				content,
				filename
			);
			setSources((prev) => [...prev, newSource]);
		} catch (error) {
			console.error('Failed to add source:', error);
		}
	};

	const handleUpdateSource = async (source: Source, content: string) => {
		if (!activeNotebook) return;

		try {
			const updatedSource = await sourcesAPI.update(
				activeNotebook.id,
				source.id,
				content,
				source.filename
			);

			setSources((prev) =>
				prev.map((s) => (s.id === updatedSource.id ? updatedSource : s))
			);
		} catch (error) {
			console.error('Failed to update source:', error);
		}
	};

	const handleDeleteSource = async (source: Source) => {
		if (!activeNotebook) return;

		try {
			await sourcesAPI.delete(activeNotebook.id, source.id);
			setSources((prev) => prev.filter((s) => s.id !== source.id));
		} catch (error) {
			console.error('Failed to delete source:', error);
		}
	};

	
	const handleSelectModel = (model: Model) => {
		setSelectedModel(model);
	};

	const handleDownloadModel = async (model: Model) => {
		try {
			
			const updatingModels = models.map((m) =>
				m.id === model.id ? { ...m, isDownloading: true } : m
			);
			setModels(updatingModels);

			
			await new Promise((resolve) => setTimeout(resolve, 2000));

			
			const updatedModel = await modelsAPI.updateDownloadStatus(model.id, true);

			
			setModels((prev) =>
				prev.map((m) => (m.id === updatedModel.id ? updatedModel : m))
			);

			
			setSelectedModel(updatedModel);
		} catch (error) {
			console.error('Failed to download model:', error);

			
			setModels((prev) =>
				prev.map((m) =>
					m.id === model.id ? { ...m, isDownloading: false } : m
				)
			);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold mb-2">Loading DevBrain</h2>
					<p className="text-muted-foreground">Initializing database...</p>
				</div>
			</div>
		);
	}

	return (
		<MainLayout
			notebooks={notebooks}
			activeNotebook={activeNotebook}
			messages={messages}
			suggestedQuestions={suggestedQuestions}
			sources={sources}
			models={models}
			selectedModel={selectedModel}
			onSelectNotebook={handleSelectNotebook}
			onCreateNotebook={handleCreateNotebook}
			onDeleteNotebook={handleDeleteNotebook}
			onSendMessage={handleSendMessage}
			onSelectQuestion={handleSelectQuestion}
			onAddSource={handleAddSource}
			onUpdateSource={handleUpdateSource}
			onDeleteSource={handleDeleteSource}
			onSelectModel={handleSelectModel}
			onDownloadModel={handleDownloadModel}
		/>
	);
}
