import type { Meta, StoryObj } from '@storybook/react';
import { NotebooksSidebarSkeleton } from './notebooks-sidebar-skeleton';

const meta: Meta<typeof NotebooksSidebarSkeleton> = {
	title: 'Skeletons/NotebooksSidebarSkeleton',
	component: NotebooksSidebarSkeleton,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof NotebooksSidebarSkeleton>;

export const Default: Story = {
	args: {},
};

export const WithCustomClass: Story = {
	args: {
		className: 'border border-primary rounded-md',
	},
};
