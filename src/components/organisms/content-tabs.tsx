'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { TabButton } from '@/components/molecules/tab-button';
import { ChatInterface } from '@/components/organisms/chat-interface';
import { SourcesList } from '@/components/organisms/sources-list';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Source } from '@/types/source';

type Tab = 'chat' | 'sources';

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
					<ChatInterface
						messages={messages}
						suggestedQuestions={suggestedQuestions}
						onSendMessage={onSendMessage}
						onSelectQuestion={onSelectQuestion}
						disabled={sources.length === 0}
					/>
				) : (
					<SourcesList
						sources={sources}
						onAddSource={onAddSource}
						onUpdateSource={onUpdateSource}
						onDeleteSource={onDeleteSource}
					/>
				)}
			</div>
		</div>
	);
}
