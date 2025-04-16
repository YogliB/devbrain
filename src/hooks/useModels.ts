import { useState, useEffect, useCallback } from 'react';
import { Model, ModelDownloadStatus } from '@/types/model';
import { modelsAPI } from '@/lib/api';
import webLLMService from '@/lib/webllm-service';

export function useModels() {
	const [models, setModels] = useState<Model[]>([]);
	const [selectedModel, setSelectedModel] = useState<Model | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	const initializeWebLLM = useCallback(async () => {
		try {
			const modelsData = await modelsAPI.getAll();

			const webLLMModels = await webLLMService.getAvailableModels();

			const enhancedModels = await Promise.all(
				modelsData.map(async (model) => {
					const webLLMModel = webLLMModels.find(
						(wm) =>
							wm.model_id
								.toLowerCase()
								.includes(model.name.toLowerCase()) ||
							model.name
								.toLowerCase()
								.includes(wm.model_id.toLowerCase()),
					);

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
						isDownloaded: isReallyDownloaded,
					};
				}),
			);

			setModels(enhancedModels);

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

			if (!model.webLLMId) {
				throw new Error('Model does not have a WebLLM ID');
			}

			const downloadSuccess = await webLLMService.downloadModel(model);

			webLLMService.removeDownloadProgressListener(
				model.id,
				progressListener,
			);
			webLLMService.removeStatusListener(model.id, statusListener);

			if (downloadSuccess) {
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

				setSelectedModel({
					...model,
					isDownloaded: true,
					downloadStatus: 'downloaded',
					downloadProgress: 100,
				});

				return model;
			} else {
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
