import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { LoginForm } from './login-form';

const meta: Meta<typeof LoginForm> = {
	title: 'Molecules/LoginForm',
	component: LoginForm,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		onSuccess: { action: 'onSuccess' },
		onRegisterClick: { action: 'onRegisterClick' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
	args: {
		onSuccess: fn(),
		onRegisterClick: fn(),
	},
};
