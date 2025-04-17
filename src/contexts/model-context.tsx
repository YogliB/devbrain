'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useRef,
} from 'react';
import { Model, ModelDownloadStatus } from '@/types/model';
import { useModelDownload } from '@/hooks/useModelDownload';
import { modelsAPI } from '@/lib/api';
import { webLLMService, MemoryError } from '@/lib/webllm';

interface ModelContextType {
	models: Model[];
	selectedModel: Model | null;
	isLoading: boolean;
	downloadModel: (model: Model) => Promise<Model>;
	cancelDownload: (modelId: string) => boolean;
	removeModel: (modelId: string) => boolean;
	selectModel: (model: Model) => void;
	isDownloading: (modelId: string) => boolean;
	getDownloadProgress: (modelId: string) => number;
	getDownloadStatus: (modelId: string) => ModelDownloadStatus;
	isModelDownloaded: (modelId: string) => boolean;
	getMemoryError: (modelId: string) => MemoryError | null;
	clearMemoryError: (modelId: string) => void;
	getSmallerModelRecommendation: (modelId: string) => string | null;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
	const [models, setModels] = useState<Model[]>([]);
	const [selectedModel, setSelectedModel] = useState<Model | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	// Use a ref to track when we need to refresh models
	const shouldRefreshModels = useRef(true);

	const {
		downloadModel: downloadModelHook,
		cancelDownload,
		removeModel: removeModelHook,
		isDownloading,
		getDownloadProgress,
		getDownloadStatus,
		isModelDownloaded,
		getMemoryError,
		clearMemoryError,
	} = useModelDownload();

	// Fetch models from the API
	useEffect(() => {
		async function fetchModels() {
			if (!shouldRefreshModels.current) return;

			try {
				setIsLoading(true);
				const modelsData = await modelsAPI.getAll();

				// First, provide the models to WebLLM service so it can check the cache
				webLLMService.setAvailableModels(modelsData);

				// Enhance models with runtime properties
				const enhancedModels = modelsData.map((model) => {
					// Get the current download status
					const status = getDownloadStatus(model.id);
					// If the model has a status (like 'cancelled'), use it
					const downloadStatus: ModelDownloadStatus =
						status !== 'not-downloaded'
							? status
							: isModelDownloaded(model.id)
								? 'downloaded'
								: 'not-downloaded';

					// Check for memory errors
					const hasMemoryError = webLLMService.hasMemoryError(
						model.id,
					);

					// Ensure cancelled models and models with memory errors are never considered downloaded
					const isModelDownloadedValue =
						downloadStatus === 'downloaded' && !hasMemoryError;

					// Debug logging
					console.log(
						`Model ${model.id} enhanced with status: ${downloadStatus}, isDownloaded: ${isModelDownloadedValue}, hasMemoryError: ${hasMemoryError}`,
					);

					return {
						...model,
						isDownloaded: isModelDownloadedValue,
						downloadStatus,
					};
				});

				setModels(enhancedModels);

				// Set the first downloaded model as selected, or the first model if none are downloaded
				const downloadedModel = enhancedModels.find(
					(m) => m.isDownloaded,
				);
				if (downloadedModel) {
					setSelectedModel(downloadedModel);
					webLLMService.setActiveModel(downloadedModel.id);
				} else if (enhancedModels.length > 0) {
					setSelectedModel(enhancedModels[0]);
				}

				// Reset the refresh flag
				shouldRefreshModels.current = false;
			} catch (error) {
				console.error('Failed to fetch models:', error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchModels();
	}, []); // Empty dependency array to avoid infinite loops

	// Download a model
	const downloadModel = useCallback(
		async (model: Model): Promise<Model> => {
			try {
				const updatedModel = await downloadModelHook(model);

				// Update the models list with the downloaded model
				setModels((prev) =>
					prev.map((m) =>
						m.id === updatedModel.id
							? {
									...m,
									isDownloaded: updatedModel.isDownloaded,
									downloadStatus: updatedModel.downloadStatus,
									downloadProgress:
										updatedModel.downloadProgress,
								}
							: m,
					),
				);

				// Set as selected model if it was successfully downloaded
				if (updatedModel.downloadStatus === 'downloaded') {
					setSelectedModel(updatedModel);
					webLLMService.setActiveModel(updatedModel.id);
				}

				// Set the refresh flag to true for the next render
				shouldRefreshModels.current = true;

				return updatedModel;
			} catch (error) {
				console.error('Failed to download model:', error);

				// Check if this is a memory error
				if (
					error instanceof Error &&
					((error as any).type === 'out-of-memory' ||
						error.message.includes('Out of memory') ||
						error.message.includes('Cannot allocate Wasm memory'))
				) {
					// Update the models list to reflect the memory error
					setModels((prev) =>
						prev.map((m) =>
							m.id === model.id
								? {
										...m,
										isDownloaded: false,
										downloadStatus: 'failed',
										downloadProgress: 0,
									}
								: m,
						),
					);
				}

				throw error;
			}
		},
		[downloadModelHook],
	);

	// Add a wrapper for cancelDownload to update the models state
	const handleCancelDownload = useCallback(
		(modelId: string): boolean => {
			const result = cancelDownload(modelId);

			if (result) {
				// Update the models list to reflect the cancelled status
				setModels((prev) =>
					prev.map((m) =>
						m.id === modelId
							? {
									...m,
									isDownloaded: false,
									downloadStatus: 'cancelled',
									downloadProgress: 0,
								}
							: m,
					),
				);

				// Set the refresh flag to true for the next render
				shouldRefreshModels.current = true;
			}

			return result;
		},
		[cancelDownload],
	);

	// Add a wrapper for removeModel to update the models state
	const handleRemoveModel = useCallback(
		(modelId: string): boolean => {
			const result = removeModelHook(modelId);

			if (result) {
				// Update the models list to reflect the removed status
				setModels((prev) =>
					prev.map((m) =>
						m.id === modelId
							? {
									...m,
									isDownloaded: false,
									downloadStatus: 'not-downloaded',
									downloadProgress: 0,
								}
							: m,
					),
				);

				// If this was the selected model, select another downloaded model or the first model
				if (selectedModel && selectedModel.id === modelId) {
					const downloadedModel = models.find(
						(m) => m.isDownloaded && m.id !== modelId,
					);
					if (downloadedModel) {
						setSelectedModel(downloadedModel);
						webLLMService.setActiveModel(downloadedModel.id);
					} else if (models.length > 0) {
						setSelectedModel(models[0]);
					} else {
						setSelectedModel(null);
					}
				}

				// Set the refresh flag to true for the next render
				shouldRefreshModels.current = true;
			}

			return result;
		},
		[removeModelHook, selectedModel, models],
	);

	/**
	 * Get a smaller model recommendation based on a model ID
	 * @param modelId The ID of the model to get a recommendation for
	 * @returns The ID of a recommended smaller model, or null if none is available
	 */
	const getSmallerModelRecommendation = useCallback(
		(modelId: string): string | null => {
			return webLLMService.getSmallerModelRecommendation(modelId);
		},
		[],
	);

	// Select a model
	const selectModel = useCallback((model: Model) => {
		setSelectedModel(model);

		// If the model is downloaded, set it as the active model
		if (model.isDownloaded) {
			webLLMService.setActiveModel(model.id);
		}
	}, []);

	// Clean up resources when the component unmounts
	useEffect(
		() => () => {
			webLLMService.cleanup();
		},
		[],
	);

	const value = {
		models,
		selectedModel,
		isLoading,
		downloadModel,
		cancelDownload: handleCancelDownload,
		removeModel: handleRemoveModel,
		selectModel,
		isDownloading,
		getDownloadProgress,
		getDownloadStatus,
		isModelDownloaded,
		getMemoryError,
		clearMemoryError,
		getSmallerModelRecommendation,
	};

	return (
		<ModelContext.Provider value={value}>{children}</ModelContext.Provider>
	);
}

export function useModel() {
	const context = useContext(ModelContext);
	if (context === undefined) {
		throw new Error('useModel must be used within a ModelProvider');
	}
	return context;
}
