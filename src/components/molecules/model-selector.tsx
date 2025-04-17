'use client';

import React, { useState, useEffect } from 'react';
import {
	Check,
	ChevronDown,
	Download,
	AlertCircle,
	Loader2,
	XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Model, ModelDownloadStatus } from '@/types/model';
import { ProgressBar } from '@/components/atoms/progress-bar';

interface ModelSelectorProps {
	className?: string;
	models: Model[];
	selectedModel: Model | null;
	onSelectModel: (model: Model) => void;
	onDownloadModel: (model: Model) => void;
	onCancelDownload?: (modelId: string) => boolean;
	isDownloading?: (modelId: string) => boolean;
}

export function ModelSelector({
	className,
	models,
	selectedModel,
	onSelectModel,
	onDownloadModel,
	onCancelDownload,
	isDownloading,
}: ModelSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [showModelInfo, setShowModelInfo] = useState<Model | null>(null);
	const [localModels, setLocalModels] = useState<Model[]>(models);

	// Update local models when props change
	useEffect(() => {
		// Log incoming models for debugging
		console.log(
			'Models from props:',
			models.map((m) => ({
				id: m.id,
				name: m.name,
				status: m.downloadStatus,
			})),
		);

		// Always update local models to reflect the latest state
		setLocalModels(models);

		// If the selected model is one of the updated models, update it too
		if (selectedModel) {
			const updatedSelectedModel = models.find(
				(m) => m.id === selectedModel.id,
			);
			if (
				updatedSelectedModel &&
				(updatedSelectedModel.downloadStatus !==
					selectedModel.downloadStatus ||
					updatedSelectedModel.isDownloaded !==
						selectedModel.isDownloaded)
			) {
				// Only update if the status has changed
				console.log('Updating selected model:', {
					old: {
						status: selectedModel.downloadStatus,
						isDownloaded: selectedModel.isDownloaded,
					},
					new: {
						status: updatedSelectedModel.downloadStatus,
						isDownloaded: updatedSelectedModel.isDownloaded,
					},
				});
				onSelectModel(updatedSelectedModel);
			}
		}

		// If we're showing model info, update it too
		if (showModelInfo) {
			const updatedModelInfo = models.find(
				(m) => m.id === showModelInfo.id,
			);
			if (
				updatedModelInfo &&
				(updatedModelInfo.downloadStatus !==
					showModelInfo.downloadStatus ||
					updatedModelInfo.downloadProgress !==
						showModelInfo.downloadProgress)
			) {
				// Only update if the status or progress has changed
				console.log('Updating model info:', {
					old: {
						status: showModelInfo.downloadStatus,
						progress: showModelInfo.downloadProgress,
					},
					new: {
						status: updatedModelInfo.downloadStatus,
						progress: updatedModelInfo.downloadProgress,
					},
				});
				setShowModelInfo(updatedModelInfo);
			}
		}
	}, [models, selectedModel, onSelectModel, showModelInfo]);

	const toggleDropdown = () => setIsOpen(!isOpen);

	const handleModelSelect = (model: Model) => {
		if (model.isDownloaded) {
			onSelectModel(model);
			setIsOpen(false);
		} else {
			setShowModelInfo(model);
		}
	};

	const handleDownload = (model: Model, e: React.MouseEvent) => {
		e.stopPropagation();

		// Create an updated model with downloading status
		const modelToDownload = {
			...model,
			downloadStatus: 'downloading' as ModelDownloadStatus,
			downloadProgress: 0,
		};

		// Log the action
		console.log('Starting download for model:', {
			id: modelToDownload.id,
			name: modelToDownload.name,
			status: modelToDownload.downloadStatus,
		});

		// Start the download with the updated model
		onDownloadModel(modelToDownload);
		setShowModelInfo(null);
	};

	const handleCancelDownload = (model: Model, e: React.MouseEvent) => {
		e.stopPropagation();
		if (onCancelDownload) {
			// Log the action
			console.log('Cancelling download for model:', {
				id: model.id,
				name: model.name,
			});

			// Cancel the download
			onCancelDownload(model.id);
		}
	};

	// Helper to render the status icon based on download status
	const renderStatusIcon = (model: Model) => {
		// Check if the model is downloading using the isDownloading function if available
		const modelIsDownloading = isDownloading
			? isDownloading(model.id)
			: model.downloadStatus === 'downloading';

		// Debug logging to see what's happening
		console.log(`Rendering status icon for model ${model.id}:`, {
			isDownloaded: model.isDownloaded,
			downloadStatus: model.downloadStatus,
			modelIsDownloading,
		});

		if (model.isDownloaded) {
			return <Check className="h-4 w-4 text-green-500" />;
		}

		if (modelIsDownloading) {
			return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
		}

		if (model.downloadStatus === 'failed') {
			return <AlertCircle className="h-4 w-4 text-red-500" />;
		}

		if (model.downloadStatus === 'cancelled') {
			return <XCircle className="h-4 w-4 text-amber-500" />;
		}

		return <Download className="h-4 w-4 text-muted-foreground" />;
	};

	// Helper to render the selected model display with appropriate icon
	const renderSelectedModelDisplay = () => {
		// Check if any model is currently downloading using the isDownloading function if available
		const isAnyModelDownloading = isDownloading
			? models.some((model) => isDownloading(model.id))
			: models.some((model) => model.downloadStatus === 'downloading');

		// Debug logging to see what's happening
		console.log('Model selector state:', {
			modelsFromProps: models.map((m) => ({
				id: m.id,
				name: m.name,
				status: m.downloadStatus,
			})),
			localModels: localModels.map((m) => ({
				id: m.id,
				name: m.name,
				status: m.downloadStatus,
			})),
			isAnyModelDownloading,
			selectedModel: selectedModel
				? {
						id: selectedModel.id,
						name: selectedModel.name,
						status: selectedModel.downloadStatus,
					}
				: null,
			isDownloadingFunction: isDownloading
				? 'available'
				: 'not available',
		});

		if (!selectedModel) {
			return (
				<>
					<span>Select a model</span>
					{isAnyModelDownloading ? (
						<div className="flex items-center">
							<Loader2 className="h-4 w-4 text-blue-500 animate-spin mr-2" />
							<ChevronDown className="h-4 w-4" />
						</div>
					) : (
						<ChevronDown className="h-4 w-4 ml-2" />
					)}
				</>
			);
		}

		// Show loader when the selected model is downloading or any model is downloading
		if (
			selectedModel.downloadStatus === 'downloading' ||
			isAnyModelDownloading
		) {
			return (
				<>
					<span>{selectedModel.name}</span>
					<div className="flex items-center">
						<Loader2 className="h-4 w-4 text-blue-500 animate-spin mr-2" />
						<ChevronDown className="h-4 w-4" />
					</div>
				</>
			);
		}

		return (
			<>
				<span>{selectedModel.name}</span>
				<ChevronDown className="h-4 w-4 ml-2" />
			</>
		);
	};

	return (
		<div className={cn('relative', className)}>
			<button
				onClick={toggleDropdown}
				className="flex items-center justify-between w-full px-4 py-2 text-left bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
			>
				{renderSelectedModelDisplay()}
			</button>

			{isOpen && (
				<div className="absolute z-10 mt-1 w-full bg-popover border border-border rounded-md shadow-lg">
					<ul className="py-1 max-h-60 overflow-auto">
						{models.map((model) => (
							<li
								key={model.id}
								onClick={() => handleModelSelect(model)}
								className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
							>
								<span>{model.name}</span>
								<span className="flex items-center">
									{renderStatusIcon(model)}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{showModelInfo && (
				<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-md w-full">
						<h3 className="text-lg font-semibold mb-4">
							{showModelInfo.name}
						</h3>
						<div className="space-y-2 mb-6">
							<p>
								<span className="font-medium">Parameters:</span>{' '}
								{showModelInfo.parameters}
							</p>
							<p>
								<span className="font-medium">Size:</span>{' '}
								{showModelInfo.size}
							</p>
							<p>
								<span className="font-medium">Use case:</span>{' '}
								{showModelInfo.useCase}
							</p>
							{showModelInfo.webLLMId && (
								<p>
									<span className="font-medium">
										WebLLM ID:
									</span>{' '}
									{showModelInfo.webLLMId}
								</p>
							)}
						</div>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowModelInfo(null)}
								className="px-4 py-2 border border-input rounded-md hover:bg-muted"
							>
								Cancel
							</button>
							{showModelInfo.downloadStatus === 'downloading' ? (
								<div className="flex space-x-2">
									<button
										onClick={(e) =>
											handleCancelDownload(
												showModelInfo,
												e,
											)
										}
										className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 flex items-center"
									>
										<XCircle className="h-4 w-4 mr-2" />
										Cancel
									</button>
								</div>
							) : (
								<button
									onClick={(e) =>
										handleDownload(showModelInfo, e)
									}
									className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center"
									disabled={
										showModelInfo.downloadStatus ===
										('downloading' as ModelDownloadStatus)
									}
								>
									<Download className="h-4 w-4 mr-2" />
									Download
								</button>
							)}
						</div>
						{showModelInfo.downloadStatus ===
							('downloading' as ModelDownloadStatus) &&
							showModelInfo.downloadProgress !== undefined && (
								<div className="mt-4">
									<ProgressBar
										progress={
											showModelInfo.downloadProgress
										}
										showPercentage
										size="md"
										status="default"
									/>
								</div>
							)}
						{showModelInfo.downloadStatus ===
							('failed' as ModelDownloadStatus) && (
							<div className="mt-4 text-red-500 flex items-center">
								<AlertCircle className="h-4 w-4 mr-2" />
								Download failed. Please try again.
							</div>
						)}
						{showModelInfo.downloadStatus ===
							('cancelled' as ModelDownloadStatus) && (
							<div className="mt-4 text-amber-500 flex items-center">
								<XCircle className="h-4 w-4 mr-2" />
								Download cancelled.
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
