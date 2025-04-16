'use client';

import { MainLayout } from '@/components/templates/main-layout';
import { suggestedQuestions } from '@/lib/data/suggestedQuestionsData';
import { useAppInitialization } from '@/hooks/useAppInitialization';

export default function Home() {
	// Initialize app and get shared state and functions
	const {
		// State
		isLoading,
		notebooks,
		activeNotebook,
		messages,
		sources,
		models,
		selectedModel,

		// Notebook functions
		selectNotebook,
		createNotebook,
		deleteNotebook,

		// Message functions
		sendMessage,
		selectQuestion,

		// Source functions
		addSource,
		updateSource,
		deleteSource,

		// Model functions
		selectModel,
		downloadModel
	} = useAppInitialization();

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
			models={models}
			selectedModel={selectedModel}
			onSelectNotebook={selectNotebook}
			onCreateNotebook={createNotebook}
			onDeleteNotebook={deleteNotebook}
			onSendMessage={sendMessage}
			onSelectQuestion={selectQuestion}
			onAddSource={addSource}
			onUpdateSource={updateSource}
			onDeleteSource={deleteSource}
			onSelectModel={selectModel}
			onDownloadModel={downloadModel}
		/>
	);
}
