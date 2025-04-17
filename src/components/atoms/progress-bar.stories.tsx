import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './progress-bar';

const meta: Meta<typeof ProgressBar> = {
	title: 'Atoms/ProgressBar',
	component: ProgressBar,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		progress: {
			control: { type: 'range', min: 0, max: 100, step: 1 },
			description: 'Progress value (0-100)',
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Size of the progress bar',
		},
		showPercentage: {
			control: 'boolean',
			description: 'Show percentage text',
		},
		status: {
			control: 'select',
			options: ['default', 'success', 'error', 'warning'],
			description: 'Status of the progress bar',
		},
		className: {
			control: 'text',
			description: 'Additional CSS classes',
		},
	},
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
	args: {
		progress: 50,
		size: 'md',
		showPercentage: false,
		status: 'default',
	},
};

export const Small: Story = {
	args: {
		progress: 75,
		size: 'sm',
		showPercentage: true,
		status: 'default',
	},
};

export const Large: Story = {
	args: {
		progress: 75,
		size: 'lg',
		showPercentage: true,
		status: 'default',
	},
};

export const WithPercentage: Story = {
	args: {
		progress: 65,
		size: 'md',
		showPercentage: true,
		status: 'default',
	},
};

export const Success: Story = {
	args: {
		progress: 100,
		size: 'md',
		showPercentage: true,
		status: 'success',
	},
};

export const Error: Story = {
	args: {
		progress: 35,
		size: 'md',
		showPercentage: true,
		status: 'error',
	},
};

export const Warning: Story = {
	args: {
		progress: 50,
		size: 'md',
		showPercentage: true,
		status: 'warning',
	},
};
