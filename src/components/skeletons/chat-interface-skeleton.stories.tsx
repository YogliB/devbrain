import type { Meta, StoryObj } from '@storybook/react';
import { ChatInterfaceSkeleton } from './chat-interface-skeleton';

const meta: Meta<typeof ChatInterfaceSkeleton> = {
	title: 'Skeletons/ChatInterfaceSkeleton',
	component: ChatInterfaceSkeleton,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof ChatInterfaceSkeleton>;

export const Default: Story = {
	args: {},
};

export const WithCustomClass: Story = {
	args: {
		className: 'border border-primary rounded-md',
	},
};
