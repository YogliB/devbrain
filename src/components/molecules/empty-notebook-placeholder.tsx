'use client';

import React from 'react';
import { BookOpen, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyNotebookPlaceholderProps {
	onCreateNotebook: () => void;
	className?: string;
}

export function EmptyNotebookPlaceholder({
	onCreateNotebook,
	className,
}: EmptyNotebookPlaceholderProps) {
	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center h-full p-8',
				className,
			)}
		>
			<div className="flex flex-col items-center text-center max-w-md">
				<BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
				<h2 className="text-2xl font-semibold mb-2">
					No Notebooks Available
				</h2>
				<p className="text-muted-foreground mb-6">
					You don't have any notebooks yet. Create your first notebook
					to start working with DevBrain.
				</p>
				<button
					onClick={onCreateNotebook}
					className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
				>
					<PlusCircle className="h-5 w-5" />
					<span>Create New Notebook</span>
				</button>
			</div>
		</div>
	);
}
