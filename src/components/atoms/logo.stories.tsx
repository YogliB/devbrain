import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from './logo';

const meta: Meta<typeof Logo> = {
	title: 'Atoms/Logo',
	component: Logo,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		iconOnly: {
			control: 'boolean',
			description: 'Show only the icon without text',
		},
		className: {
			control: 'text',
			description: 'Additional CSS classes',
		},
	},
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
	args: {
		iconOnly: false,
	},
};

export const IconOnly: Story = {
	args: {
		iconOnly: true,
	},
};

export const CustomClass: Story = {
	args: {
		className: 'p-4 bg-muted rounded-md',
	},
};
