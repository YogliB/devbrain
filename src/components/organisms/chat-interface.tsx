'use client';

import React, { Suspense, lazy } from 'react';
import { cn } from '@/lib/utils';
import { Download, Eraser } from 'lucide-react';
import {
	ChatMessage as ChatMessageType,
	SuggestedQuestion,
} from '@/types/chat';
import { ChatMessage } from '@/components/molecules/chat-message';
import { ChatInput } from '@/components/molecules/chat-input';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/atoms/error-boundary';
import { SuggestedQuestionsSkeleton } from '@/components/skeletons/suggested-questions-skeleton';

// Lazy-loaded components
const SuggestedQuestions = lazy(() =>
	import('@/components/molecules/suggested-questions').then((mod) => ({
		default: mod.SuggestedQuestions,
	})),
);

interface ChatInterfaceProps {
	messages: ChatMessageType[];
	suggestedQuestions: SuggestedQuestion[];
	onSendMessage: (message: string) => void;
	onSelectQuestion: (question: SuggestedQuestion) => void;
	onClearMessages?: () => void;
	onRegenerateQuestions?: () => void;
	disabled?: boolean;
	modelAvailable?: boolean;
	isGenerating?: boolean;
	isGeneratingQuestions?: boolean;
	className?: string;
}

export function ChatInterface({
	messages,
	suggestedQuestions,
	onSendMessage,
	onSelectQuestion,
	onClearMessages,
	onRegenerateQuestions,
	disabled = false,
	modelAvailable = true,
	isGenerating = false,
	isGeneratingQuestions = false,
	className,
}: ChatInterfaceProps) {
	return (
		<div className={cn('flex flex-col h-full', className)}>
			{messages.length > 0 && onClearMessages && (
				<div className="flex justify-end mb-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								onClick={onClearMessages}
								className="p-2 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all"
								aria-label="Clear chat"
							>
								<Eraser className="h-5 w-5" />
							</button>
						</TooltipTrigger>
						<TooltipContent sideOffset={5}>
							Clear chat history
						</TooltipContent>
					</Tooltip>
				</div>
			)}
			<div className="flex-grow overflow-y-auto relative">
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
				{!disabled && (
					<ErrorBoundary>
						<Suspense fallback={<SuggestedQuestionsSkeleton />}>
							<SuggestedQuestions
								questions={suggestedQuestions}
								onSelectQuestion={onSelectQuestion}
								isLoading={isGeneratingQuestions}
								onRefresh={onRegenerateQuestions}
							/>
						</Suspense>
					</ErrorBoundary>
				)}
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
