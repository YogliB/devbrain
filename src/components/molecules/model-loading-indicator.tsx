'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/atoms/progress-bar';
import { useModel } from '@/contexts/model-context';
import { Download, AlertCircle, Cpu, Gauge } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface ModelLoadingIndicatorProps {
	className?: string;
	isCollapsed?: boolean;
}

export function ModelLoadingIndicator({
	className,
	isCollapsed = false,
}: ModelLoadingIndicatorProps) {
	const { modelStatus, modelProgress, modelProgressText, selectedModel } =
		useModel();

	// Don't show anything if the model is loaded
	if (modelStatus === 'loaded') {
		return null;
	}

	// Get the appropriate icon based on model status
	const getStatusIcon = () => {
		if (modelStatus === 'evaluating') {
			return <Gauge className="h-5 w-5 text-primary animate-pulse" />;
		} else if (modelStatus === 'loading') {
			return <Download className="h-5 w-5 text-primary animate-pulse" />;
		} else if (modelStatus === 'error') {
			return <AlertCircle className="h-5 w-5 text-red-500" />;
		} else if (modelStatus === 'unsupported') {
			return <Cpu className="h-5 w-5 text-amber-500" />;
		} else {
			return <Download className="h-5 w-5 text-muted-foreground" />;
		}
	};

	// Get the status text
	const getStatusText = () => {
		if (modelStatus === 'evaluating') {
			return 'Evaluating Device Capabilities';
		} else if (modelStatus === 'loading') {
			return selectedModel
				? `Loading ${selectedModel.name}`
				: 'Loading AI Model';
		} else if (modelStatus === 'error') {
			return 'Error Loading Model';
		} else if (modelStatus === 'unsupported') {
			return 'Device Not Supported';
		} else {
			return 'AI Model Not Loaded';
		}
	};

	// If collapsed, show only the icon with a tooltip
	if (isCollapsed) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex justify-center p-2">
						{getStatusIcon()}
					</div>
				</TooltipTrigger>
				<TooltipContent sideOffset={5}>
					{getStatusText()}
					{modelStatus === 'loading' &&
						` (${Math.round(modelProgress)}%)`}
				</TooltipContent>
			</Tooltip>
		);
	}

	// Full view for expanded sidebar
	return (
		<div className={cn('p-4 rounded-lg border bg-card', className)}>
			<div className="flex items-center gap-3 mb-2">
				{getStatusIcon()}
				<h3 className="text-sm font-medium">{getStatusText()}</h3>
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
