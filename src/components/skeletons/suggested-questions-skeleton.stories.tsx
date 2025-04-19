import type { Meta, StoryObj } from '@storybook/react';
import { SuggestedQuestionsSkeleton } from './suggested-questions-skeleton';

const meta: Meta<typeof SuggestedQuestionsSkeleton> = {
	title: 'Skeletons/SuggestedQuestionsSkeleton',
	component: SuggestedQuestionsSkeleton,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof SuggestedQuestionsSkeleton>;

export const Default: Story = {
	args: {},
};

export const WithCustomClass: Story = {
	args: {
		className: 'border border-primary rounded-md',
	},
};
