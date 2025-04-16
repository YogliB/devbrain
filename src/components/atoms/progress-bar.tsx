'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
	progress: number; // 0-100
	className?: string;
	size?: 'sm' | 'md' | 'lg';
	showPercentage?: boolean;
	status?: 'default' | 'success' | 'error' | 'warning';
}

export function ProgressBar({
	progress,
	className,
	size = 'md',
	showPercentage = false,
	status = 'default',
}: ProgressBarProps) {
	// Ensure progress is between 0 and 100
	const clampedProgress = Math.max(0, Math.min(100, progress));

	// Determine height based on size
	const heightClass = {
		sm: 'h-1',
		md: 'h-2',
		lg: 'h-3',
	}[size];

	// Determine color based on status
	const colorClass = {
		default: 'bg-primary',
		success: 'bg-green-500',
		error: 'bg-red-500',
		warning: 'bg-yellow-500',
	}[status];

	return (
		<div className={cn('w-full', className)}>
			<div className="w-full bg-muted rounded-full overflow-hidden">
				<div
					className={cn(
						'transition-all duration-300 ease-out rounded-full',
						heightClass,
						colorClass,
					)}
					style={{ width: `${clampedProgress}%` }}
				/>
			</div>

			{showPercentage && (
				<div className="text-xs text-muted-foreground mt-1 text-right">
					{Math.round(clampedProgress)}%
				</div>
			)}
		</div>
	);
}
