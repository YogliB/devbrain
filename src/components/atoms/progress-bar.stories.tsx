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
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
		},
		showPercentage: {
			control: 'boolean',
		},
		status: {
			control: 'select',
			options: ['default', 'success', 'error', 'warning'],
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
	},
};

export const Large: Story = {
	args: {
		progress: 75,
		size: 'lg',
		showPercentage: true,
	},
};

export const Success: Story = {
	args: {
		progress: 100,
		status: 'success',
		showPercentage: true,
	},
};

export const Error: Story = {
	args: {
		progress: 35,
		status: 'error',
		showPercentage: true,
	},
};

export const Warning: Story = {
	args: {
		progress: 50,
		status: 'warning',
		showPercentage: true,
	},
};
