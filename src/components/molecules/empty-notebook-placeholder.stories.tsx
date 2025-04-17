import type { Meta, StoryObj } from '@storybook/react';
import { EmptyNotebookPlaceholder } from './empty-notebook-placeholder';

const meta: Meta<typeof EmptyNotebookPlaceholder> = {
	title: 'Molecules/EmptyNotebookPlaceholder',
	component: EmptyNotebookPlaceholder,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		onCreateNotebook: { action: 'onCreateNotebook' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof EmptyNotebookPlaceholder>;

export const Default: Story = {
	args: {},
};

export const WithCustomClass: Story = {
	args: {
		className: 'border border-primary rounded-md',
	},
};
