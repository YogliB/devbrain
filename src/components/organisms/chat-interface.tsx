import React from 'react';
import { cn } from '@/lib/utils';
import { Download, Eraser } from 'lucide-react';
import {
	ChatMessage as ChatMessageType,
	SuggestedQuestion,
} from '@/types/chat';
import { ChatMessage } from '@/components/molecules/chat-message';
import { ChatInput } from '@/components/molecules/chat-input';
import { SuggestedQuestions } from '@/components/molecules/suggested-questions';

interface ChatInterfaceProps {
	messages: ChatMessageType[];
	suggestedQuestions: SuggestedQuestion[];
	onSendMessage: (message: string) => void;
	onSelectQuestion: (question: SuggestedQuestion) => void;
	onClearMessages?: () => void;
	disabled?: boolean;
	modelAvailable?: boolean;
	isGenerating?: boolean;
	className?: string;
}

export function ChatInterface({
	messages,
	suggestedQuestions,
	onSendMessage,
	onSelectQuestion,
	onClearMessages,
	disabled = false,
	modelAvailable = true,
	isGenerating = false,
	className,
}: ChatInterfaceProps) {
	return (
		<div className={cn('flex flex-col h-full', className)}>
			<div className="flex-grow overflow-y-auto relative">
				{messages.length > 0 && onClearMessages && (
					<div className="absolute top-2 right-2 z-10">
						<button
							onClick={onClearMessages}
							className="p-1.5 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
							title="Clear chat"
							aria-label="Clear chat"
						>
							<Eraser className="h-4 w-4" />
						</button>
					</div>
				)}
				{messages.length === 0 ? (
					<div className="h-full flex items-center justify-center text-muted-foreground">
						{!modelAvailable ? (
							<div className="flex flex-col items-center gap-2 text-center">
								<Download className="h-8 w-8 text-muted-foreground" />
								<div>
									<p>No AI model available</p>
									<p className="text-sm text-muted-foreground">
										Please download a model to start
										chatting
									</p>
								</div>
							</div>
						) : disabled ? (
							'Add data to start inquiring...'
						) : (
							'Send a message to start the conversation'
						)}
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
					disabled={disabled || isGenerating}
					modelAvailable={modelAvailable}
					disabledReason={
						isGenerating
							? 'Generating response...'
							: 'Add data to start inquiring...'
					}
				/>
			</div>
		</div>
	);
}
