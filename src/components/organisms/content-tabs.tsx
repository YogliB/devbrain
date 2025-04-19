'use client';

import React, { useState, Suspense, lazy } from 'react';
import { cn } from '@/lib/utils';
import { TabButton } from '@/components/molecules/tab-button';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Source } from '@/types/source';
import { useModel } from '@/contexts/model-context';
import { ErrorBoundary } from '@/components/atoms/error-boundary';

// Skeleton components for lazy loading
import { ChatInterfaceSkeleton } from '@/components/skeletons/chat-interface-skeleton';
import { SourcesListSkeleton } from '@/components/skeletons/sources-list-skeleton';

// Lazy-loaded components
const ChatInterface = lazy(() =>
	import('@/components/organisms/chat-interface').then((mod) => ({
		default: mod.ChatInterface,
	})),
);
const SourcesList = lazy(() =>
	import('@/components/organisms/sources-list').then((mod) => ({
		default: mod.SourcesList,
	})),
);

type Tab = 'chat' | 'sources';

interface ContentTabsProps {
	messages: ChatMessage[];
	suggestedQuestions: SuggestedQuestion[];
	sources: Source[];
	isGeneratingQuestions?: boolean;
	onSendMessage: (message: string) => void;
	onSelectQuestion: (question: SuggestedQuestion) => void;
	onClearMessages?: () => void;
	onRegenerateQuestions?: () => void;
	onAddSource: (content: string, filename?: string) => void;
	onUpdateSource: (source: Source, content: string) => void;
	onDeleteSource: (source: Source) => void;
	className?: string;
}

export function ContentTabs({
	messages,
	suggestedQuestions,
	sources,
	isGeneratingQuestions = false,
	onSendMessage,
	onSelectQuestion,
	onClearMessages,
	onRegenerateQuestions,
	onAddSource,
	onUpdateSource,
	onDeleteSource,
	className,
}: ContentTabsProps) {
	const [activeTab, setActiveTab] = useState<Tab>('chat');
	const [isGenerating, setIsGenerating] = useState(false);

	// Get model information from context
	const { modelAvailable } = useModel();

	return (
		<div className={cn('flex flex-col h-full', className)}>
			<div className="border-b border-border">
				<div className="flex">
					<TabButton
						isActive={activeTab === 'chat'}
						onClick={() => setActiveTab('chat')}
					>
						Chat
					</TabButton>
					<TabButton
						isActive={activeTab === 'sources'}
						onClick={() => setActiveTab('sources')}
					>
						Sources
					</TabButton>
				</div>
			</div>

			<div className="flex-grow overflow-y-auto p-4">
				{activeTab === 'chat' ? (
					<ErrorBoundary>
						<Suspense fallback={<ChatInterfaceSkeleton />}>
							<ChatInterface
								messages={messages}
								suggestedQuestions={suggestedQuestions}
								onSendMessage={(message) => {
									setIsGenerating(true);
									onSendMessage(message);
								}}
								onSelectQuestion={(question) => {
									setIsGenerating(true);
									onSelectQuestion(question);
								}}
								onClearMessages={onClearMessages}
								onRegenerateQuestions={onRegenerateQuestions}
								disabled={sources.length === 0}
								modelAvailable={modelAvailable}
								isGenerating={isGenerating}
								isGeneratingQuestions={isGeneratingQuestions}
							/>
						</Suspense>
					</ErrorBoundary>
				) : (
					<ErrorBoundary>
						<Suspense fallback={<SourcesListSkeleton />}>
							<SourcesList
								sources={sources}
								onAddSource={onAddSource}
								onUpdateSource={onUpdateSource}
								onDeleteSource={onDeleteSource}
							/>
						</Suspense>
					</ErrorBoundary>
				)}
			</div>
		</div>
	);
}
