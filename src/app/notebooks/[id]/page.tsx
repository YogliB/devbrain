'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/templates/main-layout';
import { useNotebook } from '@/contexts/notebook-context';
import { useModel } from '@/contexts/model-context';
import { useChatWithAI } from '@/hooks/useChatWithAI';

export default function NotebookPage() {
	const params = useParams();
	const router = useRouter();
	const notebookId = params.id as string;
	const [notFoundChecked, setNotFoundChecked] = useState(false);

	const {
		isLoading: appLoading,
		notebooks,
		activeNotebook,
		selectNotebook,
		createNotebook,
		deleteNotebook,
		loadNotebookById,
	} = useNotebook();

	// Track if we've already loaded this notebook
	const [notebookLoaded, setNotebookLoaded] = useState(false);

	// Load the notebook by ID when the component mounts
	useEffect(() => {
		if (!appLoading && !notebookLoaded) {
			// Try to load the notebook
			const loadNotebook = async () => {
				console.log(
					`[NotebookPage] Loading notebook with ID: ${notebookId}`,
				);

				// Check if the active notebook is already the one we want
				if (activeNotebook?.id === notebookId) {
					console.log(
						`[NotebookPage] Notebook ${notebookId} is already active`,
					);
					setNotFoundChecked(true);
					setNotebookLoaded(true);
					return;
				}

				// Otherwise, load the notebook by ID
				const notebook = await loadNotebookById(notebookId);

				// If notebook couldn't be loaded, show not found page
				if (!notebook) {
					console.error(
						`[NotebookPage] Notebook ${notebookId} not found`,
					);
					notFound();
				}

				setNotFoundChecked(true);
				setNotebookLoaded(true);
			};

			loadNotebook();
		}
	}, [
		appLoading,
		notebookId,
		loadNotebookById,
		notebookLoaded,
		activeNotebook,
	]);

	// Use the chat hook for AI interactions
	const {
		messages,
		isGenerating,
		sources,
		suggestedQuestions,
		isGeneratingQuestions,
		sendMessage,
		selectQuestion,
		clearMessages,
		addSource,
		updateSource,
		deleteSource,
		regenerateQuestions,
	} = useChatWithAI(activeNotebook?.id || null);

	// Get model status from context
	const { isModelAvailable: modelAvailable } = useModel();

	// Handle notebook deletion with navigation
	const handleDeleteNotebook = async (notebook) => {
		const success = await deleteNotebook(notebook);
		if (success) {
			// Navigate to home if the active notebook was deleted
			if (notebook.id === activeNotebook?.id) {
				router.replace('/', { scroll: false });
			}
		}
	};

	return (
		<MainLayout
			notebooks={notebooks}
			activeNotebook={activeNotebook}
			messages={messages}
			suggestedQuestions={suggestedQuestions}
			sources={sources}
			isGenerating={isGenerating}
			isGeneratingQuestions={isGeneratingQuestions}
			modelAvailable={modelAvailable}
			onSelectNotebook={(notebook) => {
				// Just update the state, don't navigate programmatically
				selectNotebook(notebook);
				// Update URL without full navigation
				router.replace(`/notebooks/${notebook.id}`, { scroll: false });
			}}
			onCreateNotebook={async () => {
				const newNotebook = await createNotebook();
				if (newNotebook) {
					router.replace(`/notebooks/${newNotebook.id}`, {
						scroll: false,
					});
				}
			}}
			onDeleteNotebook={handleDeleteNotebook}
			onSendMessage={sendMessage}
			onSelectQuestion={selectQuestion}
			onClearMessages={clearMessages}
			onRegenerateQuestions={regenerateQuestions}
			onAddSource={addSource}
			onUpdateSource={updateSource}
			onDeleteSource={deleteSource}
		/>
	);
}
