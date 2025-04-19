import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
	title: 'UI/Skeleton',
	component: Skeleton,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
	args: {
		className: 'h-10 w-full',
	},
};

export const Circle: Story = {
	args: {
		className: 'h-12 w-12 rounded-full',
	},
};

export const Card: Story = {
	render: () => (
		<div className="space-y-3">
			<Skeleton className="h-8 w-[250px]" />
			<Skeleton className="h-4 w-[200px]" />
			<Skeleton className="h-4 w-[200px]" />
			<Skeleton className="h-32 w-full" />
		</div>
	),
};

export const List: Story = {
	render: () => (
		<div className="space-y-2">
			{Array.from({ length: 5 }).map((_, i) => (
				<Skeleton key={i} className="h-12 w-full" />
			))}
		</div>
	),
};
