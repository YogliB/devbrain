'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/templates/main-layout';
import { useAppInitialization } from '@/hooks/useAppInitialization';
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
	} = useAppInitialization();

	// Load the notebook by ID when the component mounts
	useEffect(() => {
		if (!appLoading) {
			// Try to load the notebook
			const loadNotebook = async () => {
				const notebook = await loadNotebookById(notebookId);

				// If notebook couldn't be loaded, show not found page
				if (!notebook) {
					notFound();
				}

				setNotFoundChecked(true);
			};

			loadNotebook();
		}
	}, [appLoading, notebookId, loadNotebookById]);

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
				router.push('/');
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
				selectNotebook(notebook);
				router.push(`/notebooks/${notebook.id}`);
			}}
			onCreateNotebook={async () => {
				const newNotebook = await createNotebook();
				if (newNotebook) {
					router.push(`/notebooks/${newNotebook.id}`);
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
