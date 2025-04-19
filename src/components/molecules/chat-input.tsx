import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatInputProps {
	onSendMessage: (message: string) => void;
	disabled?: boolean;
	modelAvailable?: boolean;
	placeholder?: string;
	className?: string;
	disabledReason?: string;
}

export function ChatInput({
	onSendMessage,
	disabled = false,
	modelAvailable = true,
	placeholder = 'Type your message...',
	className,
	disabledReason = 'Add data to start inquiring...',
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
					placeholder={
						!modelAvailable
							? 'Please download a model first'
							: disabled
								? disabledReason
								: placeholder
					}
					disabled={disabled || !modelAvailable}
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
			<div className="relative">
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="submit"
							disabled={
								disabled || !modelAvailable || !message.trim()
							}
							className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
							aria-label="Send message"
						>
							<Send className="h-4 w-4" />
						</button>
					</TooltipTrigger>
					<TooltipContent sideOffset={5}>
						{!modelAvailable
							? 'Please download a model first'
							: disabled
								? disabledReason
								: !message.trim()
									? 'Type a message to send'
									: 'Send message'}
					</TooltipContent>
				</Tooltip>
			</div>
		</form>
	);
}
