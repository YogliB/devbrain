import { useState } from 'react';
import { Model } from '@/types/model';
import { modelsAPI } from '@/lib/api';

export function useModels() {
	const [models, setModels] = useState<Model[]>([]);
	const [selectedModel, setSelectedModel] = useState<Model | null>(null);

	const fetchModels = async () => {
		try {
			const modelsData = await modelsAPI.getAll();
			setModels(modelsData);

			// Set the first downloaded model as selected
			const downloadedModel = modelsData.find((m) => m.isDownloaded);
			if (downloadedModel) {
				setSelectedModel(downloadedModel);
			}

			return modelsData;
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
				m.id === model.id ? { ...m, isDownloading: true } : m
			);
			setModels(updatingModels);

			// Simulate download delay
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Update model download status
			const updatedModel = await modelsAPI.updateDownloadStatus(model.id, true);

			// Update models list with the downloaded model
			setModels((prev) =>
				prev.map((m) => (m.id === updatedModel.id ? updatedModel : m))
			);

			// Set as selected model
			setSelectedModel(updatedModel);
			return updatedModel;
		} catch (error) {
			console.error('Failed to download model:', error);

			// Reset downloading state on error
			setModels((prev) =>
				prev.map((m) => (m.id === model.id ? { ...m, isDownloading: false } : m))
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
	};
}
