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
				<div className="h-8 w-64 bg-muted/50 animate-pulse mb-2 rounded-md" />
				<div className="h-4 w-80 bg-muted/50 animate-pulse mb-2 rounded-md" />
				<div className="h-4 w-72 bg-muted/50 animate-pulse mb-6 rounded-md" />
				<div className="h-10 w-48 bg-muted/50 animate-pulse rounded-md" />
			</div>
		</div>
	);
}
