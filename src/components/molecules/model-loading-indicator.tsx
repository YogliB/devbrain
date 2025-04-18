'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/atoms/progress-bar';
import { useModel } from '@/contexts/model-context';
import { Download, AlertCircle, Cpu, Gauge } from 'lucide-react';

interface ModelLoadingIndicatorProps {
	className?: string;
}

export function ModelLoadingIndicator({
	className,
}: ModelLoadingIndicatorProps) {
	const { modelStatus, modelProgress, modelProgressText, selectedModel } =
		useModel();

	// Don't show anything if the model is loaded
	if (modelStatus === 'loaded') {
		return null;
	}

	return (
		<div className={cn('p-4 rounded-lg border bg-card', className)}>
			<div className="flex items-center gap-3 mb-2">
				{modelStatus === 'evaluating' ? (
					<Gauge className="h-5 w-5 text-primary animate-pulse" />
				) : modelStatus === 'loading' ? (
					<Download className="h-5 w-5 text-primary animate-pulse" />
				) : modelStatus === 'error' ? (
					<AlertCircle className="h-5 w-5 text-red-500" />
				) : modelStatus === 'unsupported' ? (
					<Cpu className="h-5 w-5 text-amber-500" />
				) : (
					<Download className="h-5 w-5 text-muted-foreground" />
				)}
				<h3 className="text-sm font-medium">
					{modelStatus === 'evaluating'
						? 'Evaluating Device Capabilities'
						: modelStatus === 'loading'
							? selectedModel
								? `Loading ${selectedModel.name}`
								: 'Loading AI Model'
							: modelStatus === 'error'
								? 'Error Loading Model'
								: modelStatus === 'unsupported'
									? 'Device Not Supported'
									: 'AI Model Not Loaded'}
				</h3>
			</div>

			{(modelStatus === 'loading' || modelStatus === 'evaluating') && (
				<>
					<ProgressBar
						progress={modelProgress}
						showPercentage={modelStatus === 'loading'}
						className="mb-2"
					/>
					<p className="text-xs text-muted-foreground">
						{modelProgressText}
					</p>
					{selectedModel && modelStatus === 'loading' && (
						<p className="text-xs text-muted-foreground mt-1">
							{selectedModel.description}
						</p>
					)}
				</>
			)}

			{modelStatus === 'error' && (
				<p className="text-xs text-red-500">
					There was an error loading the model. Please try again
					later.
				</p>
			)}

			{modelStatus === 'unsupported' && (
				<p className="text-xs text-amber-500">
					Your device does not meet the minimum requirements for any
					available AI models. Try using a device with more memory or
					WebGPU support.
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
