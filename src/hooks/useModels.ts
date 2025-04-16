import { useState, useEffect, useCallback } from 'react';
import { Model, ModelDownloadStatus } from '@/types/model';
import { modelsAPI } from '@/lib/api';
import webLLMService from '@/lib/webllm-service';

export function useModels() {
	const [models, setModels] = useState<Model[]>([]);
	const [selectedModel, setSelectedModel] = useState<Model | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	// Initialize WebLLM models and sync with our models
	const initializeWebLLM = useCallback(async () => {
		try {
			// Get models from our API
			const modelsData = await modelsAPI.getAll();

			// Get available models from WebLLM
			const webLLMModels = await webLLMService.getAvailableModels();

			// Map our models to WebLLM models and check their download status
			const enhancedModels = await Promise.all(
				modelsData.map(async (model) => {
					// Find matching WebLLM model by name (could be improved with better matching)
					const webLLMModel = webLLMModels.find(
						(wm) =>
							wm.model_id
								.toLowerCase()
								.includes(model.name.toLowerCase()) ||
							model.name
								.toLowerCase()
								.includes(wm.model_id.toLowerCase()),
					);

					// Check if model is actually downloaded in WebLLM
					const isReallyDownloaded = webLLMModel
						? await webLLMService.isModelDownloaded(
								webLLMModel.model_id,
							)
						: false;

					return {
						...model,
						webLLMId: webLLMModel?.model_id,
						downloadStatus: isReallyDownloaded
							? 'downloaded'
							: 'not-downloaded',
						// Only rely on WebLLM's state for isDownloaded, ignore database value
						isDownloaded: isReallyDownloaded,
					};
				}),
			);

			setModels(enhancedModels);

			// Set the first downloaded model as selected
			const downloadedModel = enhancedModels.find((m) => m.isDownloaded);
			if (downloadedModel) {
				setSelectedModel(downloadedModel);
			}

			setIsInitialized(true);
			return enhancedModels;
		} catch (error) {
			console.error('Failed to initialize WebLLM models:', error);
			setIsInitialized(true);
			return [];
		}
	}, []);

	// Fetch models and initialize WebLLM on mount
	useEffect(() => {
		initializeWebLLM();
	}, [initializeWebLLM]);

	const fetchModels = async () => {
		if (!isInitialized) {
			return initializeWebLLM();
		}

		try {
			// Get models from our API but don't trust their isDownloaded state
			const modelsData = await modelsAPI.getAll();

			// Re-check download status for all models
			const updatedModels = await Promise.all(
				modelsData.map(async (model) => {
					if (model.webLLMId) {
						const isDownloaded =
							await webLLMService.isModelDownloaded(
								model.webLLMId,
							);
						return {
							...model,
							isDownloaded,
							downloadStatus: isDownloaded
								? 'downloaded'
								: 'not-downloaded',
						};
					}
					return model;
				}),
			);

			setModels(updatedModels);

			// Set the first downloaded model as selected if none is selected
			if (!selectedModel) {
				const downloadedModel = updatedModels.find(
					(m) => m.isDownloaded,
				);
				if (downloadedModel) {
					setSelectedModel(downloadedModel);
				}
			}

			return updatedModels;
		} catch (error) {
			console.error('Failed to fetch models:', error);
			return [];
		}
	};

	const selectModel = (model: Model) => {
		setSelectedModel(model);
	};

	const downloadModel = async (model: Model) => {
		try {
			// Update UI to show downloading state
			const updatingModels = models.map((m) =>
				m.id === model.id
					? {
							...m,
							downloadStatus:
								'downloading' as ModelDownloadStatus,
							downloadProgress: 0,
						}
					: m,
			);
			setModels(updatingModels);

			// Set up listeners for download progress
			const progressListener = (progress: number) => {
				setModels((prev) =>
					prev.map((m) =>
						m.id === model.id
							? { ...m, downloadProgress: progress }
							: m,
					),
				);
			};

			const statusListener = (status: ModelDownloadStatus) => {
				setModels((prev) =>
					prev.map((m) =>
						m.id === model.id
							? { ...m, downloadStatus: status }
							: m,
					),
				);
			};

			webLLMService.addDownloadProgressListener(
				model.id,
				progressListener,
			);
			webLLMService.addStatusListener(model.id, statusListener);

			// Start the download process
			if (!model.webLLMId) {
				throw new Error('Model does not have a WebLLM ID');
			}

			const downloadSuccess = await webLLMService.downloadModel(model);

			// Clean up listeners
			webLLMService.removeDownloadProgressListener(
				model.id,
				progressListener,
			);
			webLLMService.removeStatusListener(model.id, statusListener);

			if (downloadSuccess) {
				// Update models list with the downloaded model
				// No need to call API to update download status anymore
				setModels((prev) =>
					prev.map((m) =>
						m.id === model.id
							? {
									...m,
									isDownloaded: true,
									downloadStatus: 'downloaded',
									downloadProgress: 100,
								}
							: m,
					),
				);

				// Set as selected model
				setSelectedModel({
					...model,
					isDownloaded: true,
					downloadStatus: 'downloaded',
					downloadProgress: 100,
				});

				return model;
			} else {
				// Update UI to show download failed
				setModels((prev) =>
					prev.map((m) =>
						m.id === model.id
							? { ...m, downloadStatus: 'failed' }
							: m,
					),
				);
				return null;
			}
		} catch (error) {
			console.error('Failed to download model:', error);

			// Reset downloading state on error
			setModels((prev) =>
				prev.map((m) =>
					m.id === model.id ? { ...m, downloadStatus: 'failed' } : m,
				),
			);
			return null;
		}
	};

	return {
		models,
		selectedModel,
		setModels,
		setSelectedModel,
		fetchModels,
		selectModel,
		downloadModel,
		isInitialized,
	};
}
