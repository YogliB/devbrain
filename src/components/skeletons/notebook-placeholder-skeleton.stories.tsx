import type { Meta, StoryObj } from '@storybook/react';
import { NotebookPlaceholderSkeleton } from './notebook-placeholder-skeleton';

const meta: Meta<typeof NotebookPlaceholderSkeleton> = {
	title: 'Skeletons/NotebookPlaceholderSkeleton',
	component: NotebookPlaceholderSkeleton,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof NotebookPlaceholderSkeleton>;

export const Default: Story = {
	args: {},
};

export const WithCustomClass: Story = {
	args: {
		className: 'border border-primary rounded-md',
	},
};
