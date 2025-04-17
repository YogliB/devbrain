import type { Meta, StoryObj } from '@storybook/react';
import { ChatInput } from './chat-input';

const meta: Meta<typeof ChatInput> = {
	title: 'Molecules/ChatInput',
	component: ChatInput,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		onSendMessage: { action: 'onSendMessage' },
		disabled: { control: 'boolean' },
		modelAvailable: { control: 'boolean' },
		placeholder: { control: 'text' },
		className: { control: 'text' },
		disabledReason: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {
	args: {
		disabled: false,
		modelAvailable: true,
		placeholder: 'Type your message...',
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		modelAvailable: true,
		disabledReason: 'Add data to start inquiring...',
	},
};

export const NoModelAvailable: Story = {
	args: {
		disabled: false,
		modelAvailable: false,
		disabledReason: 'Download a model to start chatting',
	},
};

export const DisabledAndNoModel: Story = {
	args: {
		disabled: true,
		modelAvailable: false,
		disabledReason: 'Add data and download a model to start chatting',
	},
};

export const CustomPlaceholder: Story = {
	args: {
		placeholder: 'Ask me anything about your code...',
	},
};

export const WithCustomClass: Story = {
	args: {
		className: 'border-2 border-primary rounded-xl',
	},
};
