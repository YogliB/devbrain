'use client';

import { MainLayout } from '@/components/templates/main-layout';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useModel } from '@/contexts/model-context';
import { useChatWithAI } from '@/hooks/useChatWithAI';

export default function Home() {
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
			onSelectNotebook={selectNotebook}
			onCreateNotebook={createNotebook}
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
