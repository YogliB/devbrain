import type { Meta, StoryObj } from '@storybook/react';
import { ThinkingIndicator } from './thinking-indicator';

const meta: Meta<typeof ThinkingIndicator> = {
	title: 'Atoms/ThinkingIndicator',
	component: ThinkingIndicator,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof ThinkingIndicator>;

export const Default: Story = {
	args: {},
};

export const WithCustomClass: Story = {
	args: {
		className: 'p-4 bg-muted rounded-md',
	},
};
