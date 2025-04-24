import type { Meta, StoryObj } from '@storybook/react';
import { GuestNotification } from './guest-notification';

const meta: Meta<typeof GuestNotification> = {
	title: 'Molecules/GuestNotification',
	component: GuestNotification,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof GuestNotification>;

export const Default: Story = {
	args: {},
};
