import type { Meta, StoryObj } from '@storybook/react';
import { ModelLoadingIndicator } from './model-loading-indicator';

const meta: Meta<typeof ModelLoadingIndicator> = {
	title: 'Molecules/ModelLoadingIndicator',
	component: ModelLoadingIndicator,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		className: { control: 'text' },
	},
	// The component uses the model context, which is provided by the ThemeDecorator
};

export default meta;
type Story = StoryObj<typeof ModelLoadingIndicator>;

export const Default: Story = {
	args: {},
};

export const WithCustomClass: Story = {
	args: {
		className: 'border-primary',
	},
};
