import type { Meta, StoryObj } from '@storybook/react';
import { TabButton } from './tab-button';

const meta: Meta<typeof TabButton> = {
	title: 'Molecules/TabButton',
	component: TabButton,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		isActive: { control: 'boolean' },
		onClick: { action: 'onClick' },
		children: { control: 'text' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof TabButton>;

export const Active: Story = {
	args: {
		isActive: true,
		children: 'Active Tab',
	},
};

export const Inactive: Story = {
	args: {
		isActive: false,
		children: 'Inactive Tab',
	},
};

export const WithCustomClass: Story = {
	args: {
		isActive: true,
		children: 'Custom Tab',
		className: 'bg-muted rounded-t-md',
	},
};
