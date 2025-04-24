'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/templates/main-layout';
import { ProtectedRoute } from '@/components/templates/protected-route';
import { useNotebook } from '@/contexts/notebook-context';
import { useModel } from '@/contexts/model-context';
import { useChatWithAI } from '@/hooks/useChatWithAI';

export default function Home() {
	const router = useRouter();

	const {
		isLoading: appLoading,
		notebooks,
		activeNotebook,
		selectNotebook,
		createNotebook,
		deleteNotebook,
	} = useNotebook();

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

	// Sources and messages are automatically loaded when activeNotebook changes
	// via the useEffect in useChatWithAI.ts

	// Use the model context for model availability check
	const { modelAvailable } = useModel();

	// Loading state
	const isLoading = appLoading;

	// Redirect to notebook page if a notebook is active
	useEffect(() => {
		if (!isLoading && activeNotebook) {
			// Use replace instead of push to avoid adding to history stack
			router.replace(`/notebooks/${activeNotebook.id}`, {
				scroll: false,
			});
		}
	}, [isLoading, activeNotebook, router]);

	return (
		<ProtectedRoute>
			<MainLayout
				notebooks={notebooks}
				activeNotebook={activeNotebook}
				messages={messages}
				suggestedQuestions={suggestedQuestions}
				sources={sources}
				isLoading={isLoading}
				isGenerating={isGenerating}
				isGeneratingQuestions={isGeneratingQuestions}
				modelAvailable={modelAvailable}
				onSelectNotebook={(notebook) => {
					// Just update the state, don't navigate programmatically
					selectNotebook(notebook);
					// Update URL without full navigation
					router.replace(`/notebooks/${notebook.id}`, {
						scroll: false,
					});
				}}
				onCreateNotebook={async () => {
					const newNotebook = await createNotebook();
					if (newNotebook) {
						router.replace(`/notebooks/${newNotebook.id}`, {
							scroll: false,
						});
					}
				}}
				onDeleteNotebook={deleteNotebook}
				onSendMessage={sendMessage}
				onSelectQuestion={selectQuestion}
				onClearMessages={clearMessages}
				onRegenerateQuestions={regenerateQuestions}
				onAddSource={addSource}
				onUpdateSource={updateSource}
				onDeleteSource={deleteSource}
			/>
		</ProtectedRoute>
	);
}
