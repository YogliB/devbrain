'use client';

import { useState, useCallback } from 'react';
import { Model, ModelDownloadStatus } from '@/types/model';
import { webLLMService } from '@/lib/webllm';
import { modelsAPI } from '@/lib/api';

/**
 * Custom hook for managing model downloads
 */
export function useModelDownload() {
	const [downloadingModels, setDownloadingModels] = useState<
		Record<string, boolean>
	>({});
	const [downloadProgress, setDownloadProgress] = useState<
		Record<string, number>
	>({});
	const [downloadStatus, setDownloadStatus] = useState<
		Record<string, ModelDownloadStatus>
	>({});

	/**
	 * Download a model and track progress
	 * @param model The model to download
	 * @returns A promise that resolves when the download is complete
	 */
	const downloadModel = useCallback(
		async (model: Model): Promise<Model> => {
			// Skip if already downloading
			if (downloadingModels[model.id]) {
				return model;
			}

			try {
				// Mark as downloading
				setDownloadingModels((prev) => ({ ...prev, [model.id]: true }));
				setDownloadStatus((prev) => ({
					...prev,
					[model.id]: 'downloading',
				}));
				setDownloadProgress((prev) => ({ ...prev, [model.id]: 0 }));

				// Download the model with progress tracking
				const updatedModel = await webLLMService.downloadModel(
					model,
					(progress, status) => {
						setDownloadProgress((prev) => ({
							...prev,
							[model.id]: progress,
						}));
						setDownloadStatus((prev) => ({
							...prev,
							[model.id]: status,
						}));
					},
				);

				// Update the model in the database
				if (updatedModel.downloadStatus === 'downloaded') {
					try {
						// Update the model's download status in the database
						await modelsAPI.updateDownloadStatus(model.id, true);
					} catch (error) {
						console.error(
							'Failed to update model download status in database:',
							error,
						);
					}
				}

				// Mark as no longer downloading
				setDownloadingModels((prev) => ({
					...prev,
					[model.id]: false,
				}));

				return updatedModel;
			} catch (error) {
				console.error('Failed to download model:', error);

				// Mark as failed
				setDownloadingModels((prev) => ({
					...prev,
					[model.id]: false,
				}));
				setDownloadStatus((prev) => ({
					...prev,
					[model.id]: 'failed',
				}));

				throw error;
			}
		},
		[downloadingModels],
	);

	/**
	 * Check if a model is currently downloading
	 * @param modelId The ID of the model to check
	 * @returns True if the model is downloading, false otherwise
	 */
	const isDownloading = useCallback(
		(modelId: string): boolean => {
			return !!downloadingModels[modelId];
		},
		[downloadingModels],
	);

	/**
	 * Get the download progress for a model
	 * @param modelId The ID of the model to check
	 * @returns The download progress (0-100) or 0 if not downloading
	 */
	const getDownloadProgress = useCallback(
		(modelId: string): number => {
			return downloadProgress[modelId] || 0;
		},
		[downloadProgress],
	);

	/**
	 * Get the download status for a model
	 * @param modelId The ID of the model to check
	 * @returns The download status or 'not-downloaded' if not downloading
	 */
	const getDownloadStatus = useCallback(
		(modelId: string): ModelDownloadStatus => {
			return downloadStatus[modelId] || 'not-downloaded';
		},
		[downloadStatus],
	);

	/**
	 * Check if a model is downloaded
	 * @param modelId The ID of the model to check
	 * @returns True if the model is downloaded, false otherwise
	 */
	const isModelDownloaded = useCallback((modelId: string): boolean => {
		return webLLMService.isModelDownloaded(modelId);
	}, []);

	/**
	 * Cancel a model download
	 * @param modelId The ID of the model to cancel download for
	 * @returns True if the download was cancelled, false if no download was in progress
	 */
	const cancelDownload = useCallback((modelId: string): boolean => {
		const wasCancelled = webLLMService.cancelDownload(modelId);

		if (wasCancelled) {
			// Update local state
			setDownloadingModels((prev) => ({ ...prev, [modelId]: false }));
			setDownloadStatus((prev) => ({ ...prev, [modelId]: 'cancelled' }));
			setDownloadProgress((prev) => ({ ...prev, [modelId]: 0 }));

			// Log cancellation for debugging
			console.log(`Download cancelled for model ${modelId}`);
		}

		return wasCancelled;
	}, []);

	return {
		downloadModel,
		cancelDownload,
		isDownloading,
		getDownloadProgress,
		getDownloadStatus,
		isModelDownloaded,
	};
}
