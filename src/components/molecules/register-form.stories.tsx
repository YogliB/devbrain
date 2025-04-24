import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { RegisterForm } from './register-form';

const meta: Meta<typeof RegisterForm> = {
	title: 'Molecules/RegisterForm',
	component: RegisterForm,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		onSuccess: { action: 'onSuccess' },
		onLoginClick: { action: 'onLoginClick' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof RegisterForm>;

export const Default: Story = {
	args: {
		onSuccess: fn(),
		onLoginClick: fn(),
	},
};
