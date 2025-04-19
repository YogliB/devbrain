import type { Meta, StoryObj } from '@storybook/react';
import { SourcesListSkeleton } from './sources-list-skeleton';

const meta: Meta<typeof SourcesListSkeleton> = {
	title: 'Skeletons/SourcesListSkeleton',
	component: SourcesListSkeleton,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof SourcesListSkeleton>;

export const Default: Story = {
	args: {},
};

export const WithCustomClass: Story = {
	args: {
		className: 'border border-primary rounded-md',
	},
};
