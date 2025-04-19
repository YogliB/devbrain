'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SourcesListSkeletonProps {
	className?: string;
}

export function SourcesListSkeleton({ className }: SourcesListSkeletonProps) {
	return (
		<div className={cn('space-y-4', className)}>
			<div className="border border-border rounded-md p-4">
				<Skeleton className="h-24 w-full mb-3 rounded-md" />
				<div className="flex justify-between">
					<Skeleton className="h-8 w-24 rounded-md" />
					<Skeleton className="h-8 w-20 rounded-md" />
				</div>
			</div>

			<div className="space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="border border-border rounded-md overflow-hidden"
					>
						<div className="p-3 border-b border-border flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Skeleton className="h-5 w-5 rounded-md" />
								<Skeleton className="h-5 w-32 rounded-md" />
							</div>
							<div className="flex items-center gap-1">
								<Skeleton className="h-8 w-8 rounded-md" />
								<Skeleton className="h-8 w-8 rounded-md" />
							</div>
						</div>
						<Skeleton className="h-32 w-full" />
					</div>
				))}
			</div>
		</div>
	);
}
