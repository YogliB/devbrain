'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/templates/main-layout';
import { useAppInitialization } from '@/hooks/useAppInitialization';
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
	} = useAppInitialization();

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
			router.push(`/notebooks/${activeNotebook.id}`);
		}
	}, [isLoading, activeNotebook, router]);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold mb-2">
						Loading DevBrain
					</h2>
					<p className="text-muted-foreground">
						Loading application...
					</p>
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
			onDeleteNotebook={deleteNotebook}
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
