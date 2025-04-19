'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/atoms/logo';

interface NotebooksSidebarSkeletonProps {
	className?: string;
}

export function NotebooksSidebarSkeleton({
	className,
}: NotebooksSidebarSkeletonProps) {
	return (
		<div
			className={cn(
				'w-64 border-r border-border flex flex-col h-full bg-sidebar text-sidebar-foreground',
				className,
			)}
		>
			<div className="p-4 border-b border-sidebar-border flex items-center justify-between">
				<Logo className="text-sidebar-foreground" />
			</div>

			<div className="p-4 border-b border-sidebar-border">
				<Skeleton className="h-9 w-full rounded-md" />
			</div>

			<div className="flex-grow overflow-y-auto p-2">
				<div className="space-y-1">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-10 w-full rounded-md mb-2"
						/>
					))}
				</div>
			</div>

			<div className="mt-auto p-2">
				<Skeleton className="h-10 w-full rounded-md" />
			</div>
		</div>
	);
}
