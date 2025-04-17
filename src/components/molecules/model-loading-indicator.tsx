'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/atoms/progress-bar';
import { useModel } from '@/contexts/model-context';
import { Download, AlertCircle } from 'lucide-react';

interface ModelLoadingIndicatorProps {
	className?: string;
}

export function ModelLoadingIndicator({
	className,
}: ModelLoadingIndicatorProps) {
	const { modelStatus, modelProgress, modelProgressText } = useModel();

	// Don't show anything if the model is loaded
	if (modelStatus === 'loaded') {
		return null;
	}

	return (
		<div className={cn('p-4 rounded-lg border bg-card', className)}>
			<div className="flex items-center gap-3 mb-2">
				{modelStatus === 'loading' ? (
					<Download className="h-5 w-5 text-primary animate-pulse" />
				) : modelStatus === 'error' ? (
					<AlertCircle className="h-5 w-5 text-red-500" />
				) : (
					<Download className="h-5 w-5 text-muted-foreground" />
				)}
				<h3 className="text-sm font-medium">
					{modelStatus === 'loading'
						? 'Loading AI Model'
						: modelStatus === 'error'
							? 'Error Loading Model'
							: 'AI Model Not Loaded'}
				</h3>
			</div>

			{modelStatus === 'loading' && (
				<>
					<ProgressBar
						progress={modelProgress}
						showPercentage={true}
						className="mb-2"
					/>
					<p className="text-xs text-muted-foreground">
						{modelProgressText}
					</p>
				</>
			)}

			{modelStatus === 'error' && (
				<p className="text-xs text-red-500">
					There was an error loading the model. Please try again
					later.
				</p>
			)}

			{modelStatus === 'not-loaded' && (
				<p className="text-xs text-muted-foreground">
					The AI model will be downloaded automatically when you start
					the app.
				</p>
			)}
		</div>
	);
}
