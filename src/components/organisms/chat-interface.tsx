import React from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType, SuggestedQuestion } from '@/types/chat';
import { ChatMessage } from '@/components/molecules/chat-message';
import { ChatInput } from '@/components/molecules/chat-input';
import { SuggestedQuestions } from '@/components/molecules/suggested-questions';

interface ChatInterfaceProps {
	messages: ChatMessageType[];
	suggestedQuestions: SuggestedQuestion[];
	onSendMessage: (message: string) => void;
	onSelectQuestion: (question: SuggestedQuestion) => void;
	disabled?: boolean;
	className?: string;
}

export function ChatInterface({
	messages,
	suggestedQuestions,
	onSendMessage,
	onSelectQuestion,
	disabled = false,
	className,
}: ChatInterfaceProps) {
	return (
		<div className={cn('flex flex-col h-full', className)}>
			<div className="flex-grow overflow-y-auto">
				{messages.length === 0 ? (
					<div className="h-full flex items-center justify-center text-muted-foreground">
						{disabled
							? 'Add data to start inquiring...'
							: 'Send a message to start the conversation'}
					</div>
				) : (
					<div className="divide-y divide-border">
						{messages.map((message) => (
							<ChatMessage key={message.id} message={message} />
						))}
					</div>
				)}
			</div>

			<div className="mt-4 space-y-4">
				<SuggestedQuestions
					questions={suggestedQuestions}
					onSelectQuestion={onSelectQuestion}
				/>
				<ChatInput
					onSendMessage={onSendMessage}
					disabled={disabled}
				/>
			</div>
		</div>
	);
}
