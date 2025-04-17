import type { Meta, StoryObj } from '@storybook/react';
import { ModelDownloadCard } from './model-download-card';
import { Model } from '@/types/model';

// Mock data
const notDownloadedModel: Model = {
	id: '1',
	name: 'TinyLlama-1.1B',
	parameters: '1.1B',
	size: '600MB',
	useCase: 'Fast responses, lower quality',
	isDownloaded: false,
	downloadProgress: 0,
	downloadStatus: 'not-downloaded',
};

const downloadingModel: Model = {
	id: '2',
	name: 'Phi-2',
	parameters: '2.7B',
	size: '1.7GB',
	useCase: 'Good balance of size and quality',
	isDownloaded: false,
	downloadProgress: 45,
	downloadStatus: 'downloading',
};

const downloadedModel: Model = {
	id: '3',
	name: 'Llama-2-7B',
	parameters: '7B',
	size: '3.8GB',
	useCase: 'High quality responses',
	isDownloaded: true,
	downloadProgress: 100,
	downloadStatus: 'downloaded',
};

const failedModel: Model = {
	id: '4',
	name: 'Mistral-7B',
	parameters: '7B',
	size: '4.1GB',
	useCase: 'Advanced reasoning',
	isDownloaded: false,
	downloadProgress: 0,
	downloadStatus: 'failed',
};

const cancelledModel: Model = {
	id: '5',
	name: 'Vicuna-13B',
	parameters: '13B',
	size: '7.2GB',
	useCase: 'Complex tasks',
	isDownloaded: false,
	downloadProgress: 100,
	downloadStatus: 'cancelled',
};

const meta: Meta<typeof ModelDownloadCard> = {
	title: 'Molecules/ModelDownloadCard',
	component: ModelDownloadCard,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		model: { control: 'object' },
		onDownload: { action: 'onDownload' },
		onCancel: { action: 'onCancel' },
		onRemove: { action: 'onRemove' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof ModelDownloadCard>;

export const NotDownloaded: Story = {
	args: {
		model: notDownloadedModel,
	},
};

export const Downloading: Story = {
	args: {
		model: downloadingModel,
	},
};

export const Downloaded: Story = {
	args: {
		model: downloadedModel,
	},
};

export const Failed: Story = {
	args: {
		model: failedModel,
	},
};

export const Cancelled: Story = {
	args: {
		model: cancelledModel,
	},
};

export const WithCustomClass: Story = {
	args: {
		model: downloadedModel,
		className: 'max-w-sm',
	},
};
