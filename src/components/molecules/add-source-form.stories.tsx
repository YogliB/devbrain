import type { Meta, StoryObj } from '@storybook/react';
import { AddSourceForm } from './add-source-form';

const meta: Meta<typeof AddSourceForm> = {
	title: 'Molecules/AddSourceForm',
	component: AddSourceForm,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		onAddSource: { action: 'onAddSource' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof AddSourceForm>;

export const Default: Story = {
	args: {},
};

export const WithCustomClass: Story = {
	args: {
		className: 'max-w-md',
	},
};
