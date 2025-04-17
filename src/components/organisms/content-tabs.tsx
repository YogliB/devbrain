'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { TabButton } from '@/components/molecules/tab-button';
import { ChatInterface } from '@/components/organisms/chat-interface';
import { SourcesList } from '@/components/organisms/sources-list';
import { ModelTest } from '@/components/molecules/model-test';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Source } from '@/types/source';
import { useModel } from '@/contexts/model-context';

type Tab = 'chat' | 'sources' | 'ai';

interface ContentTabsProps {
	messages: ChatMessage[];
	suggestedQuestions: SuggestedQuestion[];
	sources: Source[];
	onSendMessage: (message: string) => void;
	onSelectQuestion: (question: SuggestedQuestion) => void;
	onAddSource: (content: string, filename?: string) => void;
	onUpdateSource: (source: Source, content: string) => void;
	onDeleteSource: (source: Source) => void;
	className?: string;
}

export function ContentTabs({
	messages,
	suggestedQuestions,
	sources,
	onSendMessage,
	onSelectQuestion,
	onAddSource,
	onUpdateSource,
	onDeleteSource,
	className,
}: ContentTabsProps) {
	const [activeTab, setActiveTab] = useState<Tab>('chat');
	const [isGenerating, setIsGenerating] = useState(false);

	// Get model information from context
	const { selectedModel, isModelDownloaded } = useModel();

	// Check if a model is available for chat
	const modelAvailable =
		selectedModel !== null && isModelDownloaded(selectedModel.id);

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
					<TabButton
						isActive={activeTab === 'ai'}
						onClick={() => setActiveTab('ai')}
					>
						AI Test
					</TabButton>
				</div>
			</div>

			<div className="flex-grow overflow-y-auto p-4">
				{activeTab === 'chat' ? (
					<ChatInterface
						messages={messages}
						suggestedQuestions={suggestedQuestions}
						onSendMessage={(message) => {
							setIsGenerating(true);
							onSendMessage(message);
							// Set generating to false after a delay to simulate response time
							setTimeout(() => setIsGenerating(false), 1500);
						}}
						onSelectQuestion={(question) => {
							setIsGenerating(true);
							onSelectQuestion(question);
							// Set generating to false after a delay to simulate response time
							setTimeout(() => setIsGenerating(false), 1500);
						}}
						disabled={sources.length === 0}
						modelAvailable={modelAvailable}
						isGenerating={isGenerating}
					/>
				) : activeTab === 'sources' ? (
					<SourcesList
						sources={sources}
						onAddSource={onAddSource}
						onUpdateSource={onUpdateSource}
						onDeleteSource={onDeleteSource}
					/>
				) : (
					<ModelTest />
				)}
			</div>
		</div>
	);
}
