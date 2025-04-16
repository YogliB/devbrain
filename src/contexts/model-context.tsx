'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from 'react';
import { Model, ModelDownloadStatus } from '@/types/model';
import { useModelDownload } from '@/hooks/useModelDownload';
import { modelsAPI } from '@/lib/api';
import { webLLMService } from '@/lib/webllm';

interface ModelContextType {
	models: Model[];
	selectedModel: Model | null;
	isLoading: boolean;
	downloadModel: (model: Model) => Promise<Model>;
	cancelDownload: (modelId: string) => boolean;
	selectModel: (model: Model) => void;
	isDownloading: (modelId: string) => boolean;
	getDownloadProgress: (modelId: string) => number;
	getDownloadStatus: (modelId: string) => ModelDownloadStatus;
	isModelDownloaded: (modelId: string) => boolean;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
	const [models, setModels] = useState<Model[]>([]);
	const [selectedModel, setSelectedModel] = useState<Model | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const {
		downloadModel: downloadModelHook,
		cancelDownload,
		isDownloading,
		getDownloadProgress,
		getDownloadStatus,
		isModelDownloaded,
	} = useModelDownload();

	// Fetch models from the API
	useEffect(() => {
		async function fetchModels() {
			try {
				setIsLoading(true);
				const modelsData = await modelsAPI.getAll();

				// Enhance models with runtime properties
				const enhancedModels = modelsData.map((model) => ({
					...model,
					isDownloaded: isModelDownloaded(model.id),
					downloadStatus: isModelDownloaded(model.id)
						? ('downloaded' as ModelDownloadStatus)
						: ('not-downloaded' as ModelDownloadStatus),
				}));

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
			} catch (error) {
				console.error('Failed to fetch models:', error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchModels();
	}, [isModelDownloaded]);

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

				return updatedModel;
			} catch (error) {
				console.error('Failed to download model:', error);
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
			}

			return result;
		},
		[cancelDownload],
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
	useEffect(() => {
		return () => {
			webLLMService.cleanup();
		};
	}, []);

	const value = {
		models,
		selectedModel,
		isLoading,
		downloadModel,
		cancelDownload: handleCancelDownload,
		selectModel,
		isDownloading,
		getDownloadProgress,
		getDownloadStatus,
		isModelDownloaded,
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
