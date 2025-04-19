'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ContentTabsSkeletonProps {
	className?: string;
}

export function ContentTabsSkeleton({ className }: ContentTabsSkeletonProps) {
	return (
		<div className={cn('flex flex-col h-full', className)}>
			<div className="border-b border-border">
				<div className="flex">
					<Skeleton className="h-10 w-20 m-1 rounded-md" />
					<Skeleton className="h-10 w-20 m-1 rounded-md" />
				</div>
			</div>

			<div className="flex-grow overflow-y-auto p-4">
				<div className="space-y-4">
					<Skeleton className="h-24 w-full rounded-md" />
					<Skeleton className="h-24 w-full rounded-md" />
					<Skeleton className="h-24 w-full rounded-md" />
				</div>
			</div>
		</div>
	);
}
