import React from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/atoms/logo';
import { ThemeToggle } from '@/components/atoms/theme-toggle';
import { NotebooksSidebar } from '@/components/organisms/notebooks-sidebar';
import { ContentTabs } from '@/components/organisms/content-tabs';

import { EmptyNotebookPlaceholder } from '@/components/molecules/empty-notebook-placeholder';
import { Notebook } from '@/types/notebook';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Source } from '@/types/source';

interface MainLayoutProps {
	notebooks: Notebook[];
	activeNotebook: Notebook | null;
	messages: ChatMessage[];
	suggestedQuestions: SuggestedQuestion[];
	sources: Source[];
	isGenerating?: boolean;
	isGeneratingQuestions?: boolean;
	modelAvailable?: boolean;
	onSelectNotebook: (notebook: Notebook) => void;
	onCreateNotebook: () => void;
	onDeleteNotebook: (notebook: Notebook) => void;
	onSendMessage: (message: string) => void;
	onSelectQuestion: (question: SuggestedQuestion) => void;
	onClearMessages?: () => void;
	onRegenerateQuestions?: () => void;
	onAddSource: (content: string, filename?: string) => void;
	onUpdateSource: (source: Source, content: string) => void;
	onDeleteSource: (source: Source) => void;
	className?: string;
}

export function MainLayout({
	notebooks,
	activeNotebook,
	messages,
	suggestedQuestions,
	sources,
	isGenerating = false,
	isGeneratingQuestions = false,
	modelAvailable = false,
	onSelectNotebook,
	onCreateNotebook,
	onDeleteNotebook,
	onSendMessage,
	onSelectQuestion,
	onClearMessages,
	onRegenerateQuestions,
	onAddSource,
	onUpdateSource,
	onDeleteSource,
	className,
}: MainLayoutProps) {
	return (
		<div className={cn('flex h-screen', className)}>
			<NotebooksSidebar
				notebooks={notebooks}
				activeNotebook={activeNotebook}
				onSelectNotebook={onSelectNotebook}
				onCreateNotebook={onCreateNotebook}
				onDeleteNotebook={onDeleteNotebook}
				className="hidden md:flex"
			/>

			<div className="flex-1 flex flex-col h-full overflow-hidden">
				<header className="border-b border-border p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Logo className="md:hidden" />
						</div>
						<ThemeToggle />
					</div>
				</header>

				<main className="flex-1 overflow-hidden">
					{notebooks.length === 0 || !activeNotebook ? (
						<EmptyNotebookPlaceholder
							onCreateNotebook={onCreateNotebook}
						/>
					) : (
						<ContentTabs
							messages={messages}
							suggestedQuestions={suggestedQuestions}
							sources={sources}
							isGeneratingQuestions={isGeneratingQuestions}
							onSendMessage={onSendMessage}
							onSelectQuestion={onSelectQuestion}
							onClearMessages={onClearMessages}
							onRegenerateQuestions={onRegenerateQuestions}
							onAddSource={onAddSource}
							onUpdateSource={onUpdateSource}
							onDeleteSource={onDeleteSource}
						/>
					)}
				</main>
			</div>
		</div>
	);
}
