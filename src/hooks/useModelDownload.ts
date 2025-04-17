'use client';

import { useState, useCallback } from 'react';
import { Model, ModelDownloadStatus } from '@/types/model';
import { webLLMService, MemoryError } from '@/lib/webllm';
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
	const [memoryErrors, setMemoryErrors] = useState<
		Record<string, MemoryError>
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

				// Use a local variable to track the latest progress and status
				let latestProgress = 0;
				let latestStatus: ModelDownloadStatus = 'downloading';

				// Throttle state updates to prevent too many renders
				let lastUpdateTime = 0;
				const throttleInterval = 100; // ms - reduced to make updates more frequent

				// Set up a timer to simulate gradual progress updates
				let lastReportedProgress = 0;
				let progressTimer: NodeJS.Timeout | null = null;
				let isDownloadActive = true;

				// Function to simulate gradual progress
				const simulateProgressUpdates = () => {
					if (!isDownloadActive) return;

					// Only simulate progress if we haven't received a real update in a while
					const now = Date.now();
					if (
						now - lastUpdateTime > 1000 &&
						lastReportedProgress > 0 &&
						lastReportedProgress < 99
					) {
						// Increment progress slightly (0.5-2% at a time)
						const increment = Math.random() * 1.5 + 0.5;
						const newProgress = Math.min(
							lastReportedProgress + increment,
							99,
						);

						// Update state with simulated progress
						setDownloadProgress((prev) => ({
							...prev,
							[model.id]: newProgress,
						}));

						// Update local tracking variable
						latestProgress = newProgress;
						lastReportedProgress = newProgress;
						console.log(
							`Simulated progress update: ${newProgress.toFixed(1)}%`,
						);
					}

					// Schedule next update
					progressTimer = setTimeout(simulateProgressUpdates, 800);
				};

				// Start the progress simulation timer
				progressTimer = setTimeout(simulateProgressUpdates, 1000);

				// Download the model with progress tracking
				const updatedModel = await webLLMService.downloadModel(
					model,
					(progress, status) => {
						// Update local variables
						latestProgress = progress;
						latestStatus = status;
						lastReportedProgress = progress;

						// If status is not 'downloading', clear the timer
						if (status !== 'downloading') {
							isDownloadActive = false;
							if (progressTimer) {
								clearTimeout(progressTimer);
								progressTimer = null;
							}
						}

						// Throttle state updates
						const now = Date.now();
						if (now - lastUpdateTime > throttleInterval) {
							lastUpdateTime = now;

							// Update state
							setDownloadProgress((prev) => ({
								...prev,
								[model.id]: progress,
							}));
							setDownloadStatus((prev) => ({
								...prev,
								[model.id]: status,
							}));
						}
					},
				);

				// Clean up the timer if it's still running
				isDownloadActive = false;
				if (progressTimer) {
					clearTimeout(progressTimer);
					progressTimer = null;
				}

				// Ensure final state is updated with the latest values
				setDownloadProgress((prev) => ({
					...prev,
					[model.id]: latestProgress,
				}));
				setDownloadStatus((prev) => ({
					...prev,
					[model.id]: latestStatus,
				}));

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

				// Check if this is a memory error
				if (
					error instanceof Error &&
					(error.message.includes('Out of memory') ||
						error.message.includes('Cannot allocate Wasm memory') ||
						(error as any).type === 'out-of-memory')
				) {
					// Get the structured memory error if available
					const memError =
						webLLMService.getMemoryError(model.id) ||
						({
							name: 'WebAssemblyMemoryError',
							message: `Not enough memory to load model ${model.name}. Try a smaller model or free up browser memory.`,
							type: 'out-of-memory',
							modelId: model.id,
							recommendation:
								'Try using a smaller model like TinyLlama, or restart your browser to free up memory.',
						} as MemoryError);

					// Store the memory error
					setMemoryErrors((prev) => ({
						...prev,
						[model.id]: memError,
					}));

					// Mark as failed
					setDownloadingModels((prev) => ({
						...prev,
						[model.id]: false,
					}));
					setDownloadStatus((prev) => ({
						...prev,
						[model.id]: 'failed',
					}));

					// Get a recommendation for a smaller model
					const recommendedModelId =
						webLLMService.getSmallerModelRecommendation(model.id);
					if (recommendedModelId) {
						memError.recommendation = `Try using a smaller model like ${recommendedModelId}, or restart your browser to free up memory.`;
					}

					throw memError;
				}

				// Mark as failed for other errors
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
		(modelId: string): boolean => !!downloadingModels[modelId],
		[downloadingModels],
	);

	/**
	 * Get the download progress for a model
	 * @param modelId The ID of the model to check
	 * @returns The download progress (0-100) or 0 if not downloading
	 */
	const getDownloadProgress = useCallback(
		(modelId: string): number => downloadProgress[modelId] || 0,
		[downloadProgress],
	);

	/**
	 * Get the download status for a model
	 * @param modelId The ID of the model to check
	 * @returns The download status or 'not-downloaded' if not downloading
	 */
	const getDownloadStatus = useCallback(
		(modelId: string): ModelDownloadStatus =>
			downloadStatus[modelId] || 'not-downloaded',
		[downloadStatus],
	);

	/**
	 * Check if a model is downloaded
	 * @param modelId The ID of the model to check
	 * @returns True if the model is downloaded, false otherwise
	 */
	const isModelDownloaded = useCallback(
		(modelId: string): boolean => {
			// If the model status is 'cancelled', it's not downloaded
			if (downloadStatus[modelId] === 'cancelled') {
				console.log(
					`Model ${modelId} has cancelled status, returning false from hook`,
				);
				return false;
			}

			// If the model has a memory error, it's not downloaded
			if (
				memoryErrors[modelId] ||
				webLLMService.hasMemoryError(modelId)
			) {
				console.log(
					`Model ${modelId} has memory error, returning false from hook`,
				);
				return false;
			}

			// Otherwise, check with the WebLLM service
			const result = webLLMService.isModelDownloaded(modelId);

			// If the WebLLM service says it's not downloaded but our status says it is,
			// update our status to match reality
			if (!result && downloadStatus[modelId] === 'downloaded') {
				console.log(
					`Fixing inconsistent state: WebLLM says ${modelId} is not downloaded but status was 'downloaded'`,
				);
				setDownloadStatus((prev) => ({
					...prev,
					[modelId]: 'not-downloaded',
				}));
			}

			return result;
		},
		[downloadStatus, memoryErrors],
	);

	/**
	 * Get memory error for a model
	 * @param modelId The ID of the model to check
	 * @returns The memory error or null if none exists
	 */
	const getMemoryError = useCallback(
		(modelId: string): MemoryError | null => {
			// Check local state first
			if (memoryErrors[modelId]) {
				return memoryErrors[modelId];
			}

			// Then check the WebLLM service
			return webLLMService.getMemoryError(modelId);
		},
		[memoryErrors],
	);

	/**
	 * Clear memory error for a model
	 * @param modelId The ID of the model to clear error for
	 */
	const clearMemoryError = useCallback((modelId: string): void => {
		// Clear from local state
		setMemoryErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[modelId];
			return newErrors;
		});

		// Clear from WebLLM service
		webLLMService.clearMemoryError(modelId);
	}, []);

	/**
	 * Cancel a model download
	 * @param modelId The ID of the model to cancel download for
	 * @returns True if the download was cancelled, false if no download was in progress
	 */
	const cancelDownload = useCallback(
		(modelId: string): boolean => {
			// First update our local state to prevent any further progress updates
			setDownloadingModels((prev) => ({ ...prev, [modelId]: false }));
			setDownloadStatus((prev) => ({ ...prev, [modelId]: 'cancelled' }));
			setDownloadProgress((prev) => ({ ...prev, [modelId]: 0 }));

			// Clear any memory errors
			clearMemoryError(modelId);

			// Then cancel the download in the WebLLM service
			const wasCancelled = webLLMService.cancelDownload(modelId);

			if (wasCancelled) {
				// Log cancellation for debugging
				console.log(`Download cancelled for model ${modelId}`);
			}

			return wasCancelled;
		},
		[clearMemoryError],
	);

	return {
		downloadModel,
		cancelDownload,
		isDownloading,
		getDownloadProgress,
		getDownloadStatus,
		isModelDownloaded,
		getMemoryError,
		clearMemoryError,
	};
}
