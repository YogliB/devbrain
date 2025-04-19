'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SuggestedQuestionsSkeletonProps {
	className?: string;
}

export function SuggestedQuestionsSkeleton({
	className,
}: SuggestedQuestionsSkeletonProps) {
	return (
		<div className={cn('space-y-2', className)}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-4 rounded-full" />
					<Skeleton className="h-4 w-32" />
				</div>
				<Skeleton className="h-5 w-5 rounded-full" />
			</div>
			<div className="flex flex-wrap gap-2">
				<Skeleton className="h-8 w-32 rounded-full" />
				<Skeleton className="h-8 w-40 rounded-full" />
				<Skeleton className="h-8 w-36 rounded-full" />
			</div>
		</div>
	);
}
