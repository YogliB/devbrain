import type { Meta, StoryObj } from '@storybook/react';
import { MemoryErrorAlert } from './memory-error-alert';
import { MemoryError } from '@/lib/webllm';

// Create a decorator to provide the context values needed
const withModelContext = (Story: React.ComponentType) => {
	// Mock the useModel hook
	const mockUseModel = {
		getMemoryError: (modelId: string) =>
			({
				name: 'WebAssemblyMemoryError',
				message:
					'Not enough memory to load model. Try a smaller model or free up browser memory.',
				type: 'out-of-memory' as const,
				modelId,
				recommendation:
					'Try using a smaller model like TinyLlama, or restart your browser to free up memory.',
			}) as MemoryError,
		clearMemoryError: () => {},
		getSmallerModelRecommendation: () => 'tiny-llama',
	};

	// Override the useModel hook
	// @ts-ignore - This is a mock for Storybook
	window.useModelMock = mockUseModel;

	return <Story />;
};

const meta: Meta<typeof MemoryErrorAlert> = {
	title: 'Molecules/MemoryErrorAlert',
	component: MemoryErrorAlert,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	decorators: [withModelContext],
	argTypes: {
		modelId: { control: 'text' },
		onRetry: { action: 'onRetry' },
		onSelectSmaller: { action: 'onSelectSmaller' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof MemoryErrorAlert>;

export const Default: Story = {
	args: {
		modelId: 'llama-7b',
	},
};

export const WithCustomClass: Story = {
	args: {
		modelId: 'llama-7b',
		className: 'max-w-md',
	},
};
