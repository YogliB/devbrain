'use client';

import React from 'react';
import {
	Download,
	Loader2,
	Check,
	AlertCircle,
	XCircle,
	XSquare,
	RefreshCcw,
	Trash2,
} from 'lucide-react';
import { Model } from '@/types/model';
import { ProgressBar } from '@/components/atoms/progress-bar';
import { cn } from '@/lib/utils';
import { useModel } from '@/contexts/model-context';
import { MemoryErrorAlert } from './memory-error-alert';

interface ModelDownloadCardProps {
	model: Model;
	onDownload: (model: Model) => void;
	onCancel?: (modelId: string) => void;
	onRemove?: (modelId: string) => void;
	className?: string;
}

export function ModelDownloadCard({
	model,
	onDownload,
	onCancel,
	onRemove,
	className,
}: ModelDownloadCardProps) {
	const { getMemoryError, clearMemoryError, getSmallerModelRecommendation } =
		useModel();
	const memoryError = getMemoryError(model.id);

	const isDownloading = model.downloadStatus === 'downloading';
	const isDownloaded =
		(model.downloadStatus === 'downloaded' || model.isDownloaded) &&
		model.downloadStatus !== 'cancelled';

	const hasFailed = model.downloadStatus === 'failed';
	const wasCancelled = model.downloadStatus === 'cancelled';

	// Handle retry after memory error
	const handleRetry = () => {
		clearMemoryError(model.id);
		onDownload(model);
	};

	// Handle selecting a smaller model
	const handleSelectSmaller = (smallerModelId: string) => {
		// Get all models from context
		const { models: contextModels } = useModel();
		// Find the smaller model in the list
		const smallerModel = contextModels.find((m) => m.id === smallerModelId);
		if (smallerModel) {
			clearMemoryError(model.id);
			onDownload(smallerModel);
		}
	};

	// Determine status icon and color
	const StatusIcon = isDownloaded
		? Check
		: isDownloading
			? Loader2
			: memoryError
				? AlertCircle
				: hasFailed
					? AlertCircle
					: wasCancelled
						? XCircle
						: Download;

	const statusColor = isDownloaded
		? 'text-green-500'
		: isDownloading
			? 'text-blue-500'
			: hasFailed
				? 'text-red-500'
				: wasCancelled
					? 'text-amber-500'
					: 'text-muted-foreground';

	const statusText = isDownloaded
		? 'Downloaded'
		: isDownloading
			? 'Downloading...'
			: hasFailed
				? 'Download Failed'
				: wasCancelled
					? 'Cancelled'
					: 'Not Downloaded';

	const progressBarStatus = isDownloaded
		? ('success' as const)
		: hasFailed
			? ('error' as const)
			: wasCancelled
				? ('warning' as const)
				: ('default' as const);

	return (
		<div
			className={cn(
				'p-4 border border-border rounded-md bg-card shadow-sm',
				memoryError ? 'border-red-300 dark:border-red-800' : '',
				className,
			)}
		>
			<div className="flex items-center justify-between mb-3">
				<h3 className="font-medium">{model.name}</h3>
				<div className={cn('flex items-center gap-1', statusColor)}>
					<StatusIcon
						className={cn(
							'h-4 w-4',
							isDownloading && 'animate-spin',
						)}
					/>
					<span className="text-xs">{statusText}</span>
				</div>
			</div>

			{/* Memory error alert */}
			{memoryError && (
				<MemoryErrorAlert
					modelId={model.id}
					onRetry={handleRetry}
					onSelectSmaller={handleSelectSmaller}
					className="mt-1 mb-3"
				/>
			)}

			<div className="space-y-1 mb-3 text-xs text-muted-foreground">
				<p>
					<span className="font-medium">Parameters:</span>{' '}
					{model.parameters}
				</p>
				<p>
					<span className="font-medium">Size:</span> {model.size}
				</p>
				<p>
					<span className="font-medium">Use case:</span>{' '}
					{model.useCase}
				</p>
			</div>

			{(isDownloading || isDownloaded || wasCancelled || hasFailed) && (
				<div className="mb-3">
					<ProgressBar
						progress={
							isDownloaded
								? 100
								: wasCancelled
									? 0
									: model.downloadProgress || 0
						}
						showPercentage
						size="sm"
						status={progressBarStatus}
					/>

					{isDownloading && onCancel && (
						<button
							onClick={() => onCancel(model.id)}
							className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
						>
							<XSquare className="h-3 w-3" />
							Cancel download
						</button>
					)}
					{isDownloaded && onRemove && (
						<button
							onClick={() => onRemove(model.id)}
							className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
						>
							<Trash2 className="h-3 w-3" />
							Remove model
						</button>
					)}
				</div>
			)}

			<button
				onClick={() => !isDownloading && onDownload(model)}
				disabled={isDownloading || isDownloaded}
				className={cn(
					'w-full py-1.5 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2',
					isDownloaded
						? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default'
						: isDownloading
							? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 cursor-wait'
							: 'bg-primary text-primary-foreground hover:bg-primary/90',
				)}
			>
				{isDownloaded ? (
					<>
						<Check className="h-4 w-4" />
						Downloaded
					</>
				) : isDownloading ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />
						Downloading...
					</>
				) : (
					<>
						<Download className="h-4 w-4" />
						Download
					</>
				)}
			</button>

			{hasFailed && !memoryError && (
				<div className="mt-2 text-xs text-red-500 flex items-center gap-1">
					<AlertCircle className="h-3 w-3" />
					Download failed. Please try again.
				</div>
			)}

			{wasCancelled && (
				<div className="mt-2 text-xs text-amber-500 flex items-center gap-1">
					<XCircle className="h-3 w-3" />
					Download cancelled.
				</div>
			)}
		</div>
	);
}
