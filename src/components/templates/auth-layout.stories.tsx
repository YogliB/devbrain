import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { AuthLayout } from './auth-layout';

const meta: Meta<typeof AuthLayout> = {
	title: 'Templates/AuthLayout',
	component: AuthLayout,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
	argTypes: {
		onAuthSuccess: { action: 'onAuthSuccess' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof AuthLayout>;

export const Default: Story = {
	args: {
		onAuthSuccess: fn(),
	},
};
