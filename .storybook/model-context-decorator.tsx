import React from 'react';
import { Model, ModelDownloadStatus } from '@/types/model';
import { MemoryError } from '@/types/memory-error';

// Mock data
const mockModels: Model[] = [
	{
		id: '1',
		name: 'TinyLlama-1.1B',
		parameters: '1.1B',
		size: '600MB',
		useCase: 'Fast responses, lower quality',
		isDownloaded: true,
		downloadProgress: 100,
		downloadStatus: 'downloaded',
	},
	{
		id: '2',
		name: 'Phi-2',
		parameters: '2.7B',
		size: '1.7GB',
		useCase: 'Good balance of size and quality',
		isDownloaded: false,
		downloadProgress: 0,
		downloadStatus: 'not-downloaded',
	},
	{
		id: '3',
		name: 'Llama-2-7B',
		parameters: '7B',
		size: '3.8GB',
		useCase: 'High quality responses',
		isDownloaded: false,
		downloadProgress: 45,
		downloadStatus: 'downloading',
	},
	{
		id: '4',
		name: 'Mistral-7B',
		parameters: '7B',
		size: '4.1GB',
		useCase: 'Advanced reasoning',
		isDownloaded: false,
		downloadProgress: 0,
		downloadStatus: 'failed',
	},
];

// Mock context value
const mockContextValue = {
	models: mockModels,
	selectedModel: mockModels[0],
	isLoading: false,
	downloadModel: async (model: Model) => model,
	cancelDownload: (modelId: string) => true,
	removeModel: (modelId: string) => true,
	selectModel: (model: Model) => {},
	isDownloading: (modelId: string) => modelId === '3',
	getDownloadProgress: (modelId: string) =>
		modelId === '3' ? 45 : modelId === '1' ? 100 : 0,
	getDownloadStatus: (modelId: string): ModelDownloadStatus => {
		if (modelId === '1') return 'downloaded';
		if (modelId === '2') return 'not-downloaded';
		if (modelId === '3') return 'downloading';
		if (modelId === '4') return 'failed';
		return 'not-downloaded';
	},
	isModelDownloaded: (modelId: string) => modelId === '1',
	getMemoryError: (modelId: string): MemoryError | null => null,
	clearMemoryError: (modelId: string) => {},
	getSmallerModelRecommendation: (modelId: string) => 'tiny-llama',
};

// Create a wrapper component that provides the mock context
export const ModelContextDecorator = (Story: React.ComponentType) => {
	// Override the useModel hook for the story
	// @ts-ignore - This is for Storybook only
	window.useModel = mockContextValue;

	return <Story />;
};
