import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { NotebooksSidebar } from './notebooks-sidebar';
import { Notebook } from '@/types/notebook';

// Mock data
const mockNotebooks: Notebook[] = [
	{
		id: '1',
		title: 'JavaScript Algorithms',
		createdAt: new Date('2023-04-01'),
		updatedAt: new Date('2023-04-05'),
	},
	{
		id: '2',
		title: 'React Hooks Guide',
		createdAt: new Date('2023-04-10'),
		updatedAt: new Date('2023-04-15'),
	},
	{
		id: '3',
		title: 'CSS Grid Layout',
		createdAt: new Date('2023-04-20'),
		updatedAt: new Date('2023-04-25'),
	},
];

const meta: Meta<typeof NotebooksSidebar> = {
	title: 'Organisms/NotebooksSidebar',
	component: NotebooksSidebar,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		notebooks: { control: 'object' },
		activeNotebook: { control: 'object' },
		onSelectNotebook: { action: 'onSelectNotebook' },
		onCreateNotebook: { action: 'onCreateNotebook' },
		onDeleteNotebook: { action: 'onDeleteNotebook' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof NotebooksSidebar>;

export const Default: Story = {
	args: {
		notebooks: mockNotebooks,
		activeNotebook: mockNotebooks[0],
		onSelectNotebook: fn(),
		onCreateNotebook: fn(),
		onDeleteNotebook: fn(),
	},
};

export const NoActiveNotebook: Story = {
	args: {
		notebooks: mockNotebooks,
		activeNotebook: null,
		onSelectNotebook: fn(),
		onCreateNotebook: fn(),
		onDeleteNotebook: fn(),
	},
};

export const EmptyNotebooks: Story = {
	args: {
		notebooks: [],
		activeNotebook: null,
		onSelectNotebook: fn(),
		onCreateNotebook: fn(),
		onDeleteNotebook: fn(),
	},
};

export const WithCustomClass: Story = {
	args: {
		notebooks: mockNotebooks,
		activeNotebook: mockNotebooks[0],
		onSelectNotebook: fn(),
		onCreateNotebook: fn(),
		onDeleteNotebook: fn(),
		className: 'border border-primary rounded-md',
	},
};

export const Loading: Story = {
	args: {
		notebooks: mockNotebooks,
		activeNotebook: null,
		isLoading: true,
		onSelectNotebook: fn(),
		onCreateNotebook: fn(),
		onDeleteNotebook: fn(),
	},
};

export const LoadingCollapsed: Story = {
	render: () => (
		// Force the sidebar to be collapsed initially
		<div className="w-16">
			<NotebooksSidebar
				notebooks={mockNotebooks}
				activeNotebook={null}
				isLoading={true}
				onSelectNotebook={fn()}
				onCreateNotebook={fn()}
				onDeleteNotebook={fn()}
			/>
		</div>
	),
};
