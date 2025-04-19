'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NotebookPlaceholderSkeletonProps {
	className?: string;
}

export function NotebookPlaceholderSkeleton({
	className,
}: NotebookPlaceholderSkeletonProps) {
	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center h-full p-8',
				className,
			)}
		>
			<div className="flex flex-col items-center text-center max-w-md">
				<div className="h-16 w-16 rounded-full bg-muted/50 animate-pulse mb-4" />
				<h2 className="text-2xl font-semibold mb-2">
					Loading DevBrain
				</h2>
				<p className="text-muted-foreground mb-6">
					Loading application...
				</p>
				<div className="h-10 w-48 bg-muted/50 animate-pulse rounded-md" />
			</div>
		</div>
	);
}
