'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from 'react';
import { Model, ModelDownloadStatus } from '@/types/model';
import { modelsAPI } from '@/lib/api';

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
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
	const [models, setModels] = useState<Model[]>([]);
	const [selectedModel, setSelectedModel] = useState<Model | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	// Track model download states
	const [downloadStates, setDownloadStates] = useState<
		Record<
			string,
			{
				isDownloading: boolean;
				progress: number;
				status: ModelDownloadStatus;
				isDownloaded: boolean;
			}
		>
	>({});

	// Fetch models from the API
	useEffect(() => {
		async function fetchModels() {
			try {
				setIsLoading(true);
				const modelsData = await modelsAPI.getAll();

				// Enhance models with runtime properties
				const enhancedModels = modelsData.map((model) => {
					// Get the current download status from state or default to not-downloaded
					const state = downloadStates[model.id];
					const downloadStatus = state?.status || 'not-downloaded';
					const isDownloaded = state?.isDownloaded || false;

					return {
						...model,
						isDownloaded,
						downloadStatus,
						downloadProgress: state?.progress || 0,
					};
				});

				setModels(enhancedModels);

				// Set the first downloaded model as selected, or the first model if none are downloaded
				const downloadedModel = enhancedModels.find(
					(m) => m.isDownloaded,
				);
				if (downloadedModel) {
					setSelectedModel(downloadedModel);
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
	}, []); // Empty dependency array to avoid infinite loops

	// Check if a model is currently downloading
	const isDownloading = useCallback(
		(modelId: string): boolean => {
			return downloadStates[modelId]?.isDownloading || false;
		},
		[downloadStates],
	);

	// Get the download progress for a model
	const getDownloadProgress = useCallback(
		(modelId: string): number => {
			return downloadStates[modelId]?.progress || 0;
		},
		[downloadStates],
	);

	// Get the download status for a model
	const getDownloadStatus = useCallback(
		(modelId: string): ModelDownloadStatus => {
			return downloadStates[modelId]?.status || 'not-downloaded';
		},
		[downloadStates],
	);

	// Check if a model is downloaded
	const isModelDownloaded = useCallback(
		(modelId: string): boolean => {
			return downloadStates[modelId]?.isDownloaded || false;
		},
		[downloadStates],
	);

	// Download a model (placeholder implementation)
	const downloadModel = useCallback(async (model: Model): Promise<Model> => {
		try {
			// Set the model as downloading
			setDownloadStates((prev) => ({
				...prev,
				[model.id]: {
					isDownloading: true,
					progress: 0,
					status: 'downloading',
					isDownloaded: false,
				},
			}));

			// Simulate download progress
			const updatedModel = {
				...model,
				isDownloaded: true,
				downloadStatus: 'downloaded' as ModelDownloadStatus,
				downloadProgress: 100,
			};

			// Update the download state
			setDownloadStates((prev) => ({
				...prev,
				[model.id]: {
					isDownloading: false,
					progress: 100,
					status: 'downloaded',
					isDownloaded: true,
				},
			}));

			// Update the models list
			setModels((prev) =>
				prev.map((m) => (m.id === updatedModel.id ? updatedModel : m)),
			);

			// Set as selected model
			setSelectedModel(updatedModel);

			return updatedModel;
		} catch (error) {
			console.error('Failed to download model:', error);

			// Update the download state to failed
			setDownloadStates((prev) => ({
				...prev,
				[model.id]: {
					isDownloading: false,
					progress: 0,
					status: 'failed',
					isDownloaded: false,
				},
			}));

			// Update the models list
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

			throw error;
		}
	}, []);

	// Cancel a model download
	const cancelDownload = useCallback(
		(modelId: string): boolean => {
			// Only cancel if the model is downloading
			if (!downloadStates[modelId]?.isDownloading) {
				return false;
			}

			// Update the download state
			setDownloadStates((prev) => ({
				...prev,
				[modelId]: {
					isDownloading: false,
					progress: 0,
					status: 'cancelled',
					isDownloaded: false,
				},
			}));

			// Update the models list
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

			return true;
		},
		[downloadStates],
	);

	// Remove a downloaded model
	const removeModel = useCallback(
		(modelId: string): boolean => {
			// Only remove if the model is downloaded
			if (!downloadStates[modelId]?.isDownloaded) {
				return false;
			}

			// Update the download state
			setDownloadStates((prev) => {
				const newState = { ...prev };
				delete newState[modelId]; // Remove the model from the state
				return newState;
			});

			// Update the models list
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
				} else if (models.length > 0) {
					setSelectedModel(models[0]);
				} else {
					setSelectedModel(null);
				}
			}

			return true;
		},
		[downloadStates, selectedModel, models],
	);

	// Select a model
	const selectModel = useCallback((model: Model) => {
		setSelectedModel(model);
	}, []);

	const value = {
		models,
		selectedModel,
		isLoading,
		downloadModel,
		cancelDownload,
		removeModel,
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
