import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './theme-toggle';

const meta: Meta<typeof ThemeToggle> = {
	title: 'Atoms/ThemeToggle',
	component: ThemeToggle,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		className: {
			control: 'text',
			description: 'Additional CSS classes',
		},
	},
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {
	args: {},
};

export const WithCustomClass: Story = {
	args: {
		className: 'p-4 bg-muted rounded-md',
	},
};
