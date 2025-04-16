import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
	onSendMessage: (message: string) => void;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

export function ChatInput({
	onSendMessage,
	disabled = false,
	placeholder = 'Type your message...',
	className,
}: ChatInputProps) {
	const [message, setMessage] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (message.trim() && !disabled) {
			onSendMessage(message);
			setMessage('');
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={cn('flex items-end gap-2', className)}
		>
			<div className="flex-grow relative">
				<textarea
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder={disabled ? 'Add data to start inquiring...' : placeholder}
					disabled={disabled}
					rows={1}
					className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							handleSubmit(e);
						}
					}}
				/>
			</div>
			<button
				type="submit"
				disabled={disabled || !message.trim()}
				className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
			>
				<Send className="h-4 w-4" />
			</button>
		</form>
	);
}
