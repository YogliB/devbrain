'use client';

import React, { useState, useEffect } from 'react';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { ThinkingIndicator } from '@/components/atoms/thinking-indicator';

interface ChatMessageProps {
	message: ChatMessageType;
	className?: string;
}

export function ChatMessage({ message, className }: ChatMessageProps) {
	const isUser = message.role === 'user';
	const [mounted, setMounted] = useState(false);
	const [timeString, setTimeString] = useState<string>('');

	useEffect(() => {
		setMounted(true);
		if (message.timestamp) {
			try {
				const date =
					message.timestamp instanceof Date
						? message.timestamp
						: new Date(message.timestamp);
				setTimeString(date.toLocaleTimeString());
			} catch (error) {
				console.error('Error formatting timestamp:', error);
				setTimeString('');
			}
		}
	}, [message.timestamp]);

	return (
		<div
			className={cn(
				'flex gap-3 p-4',
				isUser ? 'bg-muted/50' : 'bg-background',
				className,
			)}
		>
			<div
				className={cn(
					'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border',
					isUser
						? 'bg-background text-foreground'
						: 'bg-primary text-primary-foreground',
				)}
			>
				{isUser ? (
					<User className="h-4 w-4" />
				) : (
					<Bot className="h-4 w-4" />
				)}
			</div>
			<div className="flex-1 space-y-2">
				<div className="prose prose-neutral dark:prose-invert">
					{message.isThinking ? (
						<ThinkingIndicator />
					) : (
						<>{message.content}</>
					)}
				</div>
				{mounted ? (
					<div className="text-xs text-muted-foreground">
						{message.isThinking ? 'Thinking...' : timeString}
					</div>
				) : (
					<div className="text-xs text-muted-foreground opacity-0">
						{/* Invisible placeholder to maintain layout during hydration */}
						00:00:00
					</div>
				)}
			</div>
		</div>
	);
}
