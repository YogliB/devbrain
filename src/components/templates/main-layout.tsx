'use client';

import React, { Suspense, lazy } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/atoms/logo';
import { ThemeToggle } from '@/components/atoms/theme-toggle';
import { EmptyNotebookPlaceholder } from '@/components/molecules/empty-notebook-placeholder';
import { Notebook } from '@/types/notebook';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Source } from '@/types/source';
import { ErrorBoundary } from '@/components/atoms/error-boundary';

// Skeleton components for lazy loading
import { NotebooksSidebarSkeleton } from '@/components/skeletons/notebooks-sidebar-skeleton';
import { ContentTabsSkeleton } from '@/components/skeletons/content-tabs-skeleton';

// Lazy-loaded components
const NotebooksSidebar = lazy(() =>
	import('@/components/organisms/notebooks-sidebar').then((mod) => ({
		default: mod.NotebooksSidebar,
	})),
);
const ContentTabs = lazy(() =>
	import('@/components/organisms/content-tabs').then((mod) => ({
		default: mod.ContentTabs,
	})),
);

interface MainLayoutProps {
	notebooks: Notebook[];
	activeNotebook: Notebook | null;
	messages: ChatMessage[];
	suggestedQuestions: SuggestedQuestion[];
	sources: Source[];
	isLoading?: boolean;
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
	isLoading = false,
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
			<ErrorBoundary>
				<Suspense
					fallback={
						<NotebooksSidebarSkeleton className="hidden md:flex" />
					}
				>
					<NotebooksSidebar
						notebooks={notebooks}
						activeNotebook={activeNotebook}
						isLoading={isLoading}
						onSelectNotebook={onSelectNotebook}
						onCreateNotebook={onCreateNotebook}
						onDeleteNotebook={onDeleteNotebook}
						className="hidden md:flex"
					/>
				</Suspense>
			</ErrorBoundary>

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
						<ErrorBoundary>
							<Suspense fallback={<ContentTabsSkeleton />}>
								<ContentTabs
									messages={messages}
									suggestedQuestions={suggestedQuestions}
									sources={sources}
									isGeneratingQuestions={
										isGeneratingQuestions
									}
									onSendMessage={onSendMessage}
									onSelectQuestion={onSelectQuestion}
									onClearMessages={onClearMessages}
									onRegenerateQuestions={
										onRegenerateQuestions
									}
									onAddSource={onAddSource}
									onUpdateSource={onUpdateSource}
									onDeleteSource={onDeleteSource}
								/>
							</Suspense>
						</ErrorBoundary>
					)}
				</main>
			</div>
		</div>
	);
}
