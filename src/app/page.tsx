'use client';

import { MainLayout } from '@/components/templates/main-layout';
import { suggestedQuestions } from '@/lib/data/suggestedQuestionsData';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useModel } from '@/contexts/model-context';

export default function Home() {
	const {
		isLoading: appLoading,
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
		addSource,
		updateSource,
		deleteSource,
	} = useAppInitialization();

	// Use the model context for model-related state and functions
	const {
		models,
		selectedModel,
		isLoading: modelsLoading,
		selectModel,
		downloadModel,
		isModelDownloaded,
		cancelDownload,
	} = useModel();

	// Combined loading state
	const isLoading = appLoading || modelsLoading;

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
			isGenerating={isGenerating}
			modelAvailable={
				selectedModel !== null && isModelDownloaded(selectedModel.id)
			}
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
			onCancelDownload={cancelDownload}
		/>
	);
}
