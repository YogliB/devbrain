import type { Meta, StoryObj } from '@storybook/react';
import { ModelSelector } from './model-selector';
import { Model } from '@/types/model';

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

const meta: Meta<typeof ModelSelector> = {
	title: 'Molecules/ModelSelector',
	component: ModelSelector,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		models: { control: 'object' },
		selectedModel: { control: 'object' },
		onSelectModel: { action: 'onSelectModel' },
		onDownloadModel: { action: 'onDownloadModel' },
		onCancelDownload: { action: 'onCancelDownload' },
		onRemoveModel: { action: 'onRemoveModel' },
		isDownloading: { action: 'isDownloading' },
	},
};

export default meta;
type Story = StoryObj<typeof ModelSelector>;

export const Default: Story = {
	args: {
		models: mockModels,
		selectedModel: mockModels[0],
	},
};

export const NoSelectedModel: Story = {
	args: {
		models: mockModels,
		selectedModel: null,
	},
};

export const WithDownloadingModel: Story = {
	args: {
		models: mockModels,
		selectedModel: mockModels[2],
	},
};

export const WithCustomClass: Story = {
	args: {
		models: mockModels,
		selectedModel: mockModels[0],
		className: 'w-64 border border-primary',
	},
};
