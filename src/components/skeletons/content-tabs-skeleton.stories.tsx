import type { Meta, StoryObj } from '@storybook/react';
import { ContentTabsSkeleton } from './content-tabs-skeleton';

const meta: Meta<typeof ContentTabsSkeleton> = {
	title: 'Skeletons/ContentTabsSkeleton',
	component: ContentTabsSkeleton,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof ContentTabsSkeleton>;

export const Default: Story = {
	args: {},
};

export const WithCustomClass: Story = {
	args: {
		className: 'border border-primary rounded-md',
	},
};
