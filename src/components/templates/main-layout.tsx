import React from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/atoms/logo';
import { ThemeToggle } from '@/components/atoms/theme-toggle';
import { NotebooksSidebar } from '@/components/organisms/notebooks-sidebar';
import { ContentTabs } from '@/components/organisms/content-tabs';
import { ModelSelector } from '@/components/molecules/model-selector';
import { Notebook } from '@/types/notebook';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Source } from '@/types/source';
import { Model } from '@/types/model';

interface MainLayoutProps {
	notebooks: Notebook[];
	activeNotebook: Notebook | null;
	messages: ChatMessage[];
	suggestedQuestions: SuggestedQuestion[];
	sources: Source[];
	models: Model[];
	selectedModel: Model | null;
	onSelectNotebook: (notebook: Notebook) => void;
	onCreateNotebook: () => void;
	onDeleteNotebook: (notebook: Notebook) => void;
	onSendMessage: (message: string) => void;
	onSelectQuestion: (question: SuggestedQuestion) => void;
	onAddSource: (content: string, filename?: string) => void;
	onUpdateSource: (source: Source, content: string) => void;
	onDeleteSource: (source: Source) => void;
	onSelectModel: (model: Model) => void;
	onDownloadModel: (model: Model) => void;
	className?: string;
}

export function MainLayout({
	notebooks,
	activeNotebook,
	messages,
	suggestedQuestions,
	sources,
	models,
	selectedModel,
	onSelectNotebook,
	onCreateNotebook,
	onDeleteNotebook,
	onSendMessage,
	onSelectQuestion,
	onAddSource,
	onUpdateSource,
	onDeleteSource,
	onSelectModel,
	onDownloadModel,
	className,
}: MainLayoutProps) {
	return (
		<div className={cn('flex h-screen', className)}>
			{/* Sidebar */}
			<NotebooksSidebar
				notebooks={notebooks}
				activeNotebook={activeNotebook}
				onSelectNotebook={onSelectNotebook}
				onCreateNotebook={onCreateNotebook}
				onDeleteNotebook={onDeleteNotebook}
				className="hidden md:flex"
			/>

			{/* Main Content */}
			<div className="flex-1 flex flex-col h-full overflow-hidden">
				{/* Header */}
				<header className="border-b border-border p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Logo className="md:hidden" />
							<ModelSelector
								models={models}
								selectedModel={selectedModel}
								onSelectModel={onSelectModel}
								onDownloadModel={onDownloadModel}
								className="w-48"
							/>
						</div>
						<ThemeToggle />
					</div>
				</header>

				{/* Content */}
				<main className="flex-1 overflow-hidden">
					<ContentTabs
						messages={messages}
						suggestedQuestions={suggestedQuestions}
						sources={sources}
						onSendMessage={onSendMessage}
						onSelectQuestion={onSelectQuestion}
						onAddSource={onAddSource}
						onUpdateSource={onUpdateSource}
						onDeleteSource={onDeleteSource}
					/>
				</main>
			</div>
		</div>
	);
}
