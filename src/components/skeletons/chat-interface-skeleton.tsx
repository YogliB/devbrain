'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatInterfaceSkeletonProps {
	className?: string;
}

export function ChatInterfaceSkeleton({
	className,
}: ChatInterfaceSkeletonProps) {
	return (
		<div className={cn('flex flex-col h-full', className)}>
			<div className="flex-grow overflow-y-auto relative">
				<div className="divide-y divide-border">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="py-4">
							<div className="flex items-start gap-3">
								<Skeleton className="h-8 w-8 rounded-full" />
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-20 w-full rounded-md" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="mt-4 space-y-4">
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Skeleton className="h-5 w-32" />
					</div>
					<div className="flex flex-wrap gap-2">
						<Skeleton className="h-8 w-32 rounded-full" />
						<Skeleton className="h-8 w-40 rounded-full" />
						<Skeleton className="h-8 w-36 rounded-full" />
					</div>
				</div>
				<Skeleton className="h-12 w-full rounded-md" />
			</div>
		</div>
	);
}
