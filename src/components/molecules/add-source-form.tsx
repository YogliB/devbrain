'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddSourceFormProps {
	onAddSource: (content: string, filename?: string) => void;
	className?: string;
}

export function AddSourceForm({ onAddSource, className }: AddSourceFormProps) {
	const [content, setContent] = useState('');
	const [filename, setFilename] = useState('');
	const [isExpanded, setIsExpanded] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (content.trim()) {
			onAddSource(content, filename.trim() || undefined);
			setContent('');
			setFilename('');
			setIsExpanded(false);
		}
	};

	return (
		<div className={cn('border border-border rounded-md', className)}>
			<div
				className="flex items-center justify-between bg-muted/50 px-4 py-2 cursor-pointer"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<span className="font-medium">Add Source</span>
				<Plus className="h-4 w-4" />
			</div>
			{isExpanded && (
				<form onSubmit={handleSubmit} className="p-4 space-y-4">
					<div className="space-y-2">
						<label
							htmlFor="filename"
							className="text-sm font-medium text-foreground"
						>
							Filename/Tag (optional)
						</label>
						<input
							id="filename"
							value={filename}
							onChange={(e) => setFilename(e.target.value)}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							placeholder="Enter a filename or tag"
						/>
					</div>
					<div className="space-y-2">
						<label
							htmlFor="content"
							className="text-sm font-medium text-foreground"
						>
							Content
						</label>
						<textarea
							id="content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className="w-full min-h-[150px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							placeholder="Enter source content"
							required
						/>
					</div>
					<div className="flex justify-end">
						<button
							type="submit"
							className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
						>
							Add Source
						</button>
					</div>
				</form>
			)}
		</div>
	);
}
