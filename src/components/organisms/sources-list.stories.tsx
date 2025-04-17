import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { SourcesList } from './sources-list';
import { Source } from '@/types/source';

// Mock data
const mockSources: Source[] = [
	{
		id: '1',
		content:
			'# Binary Search Tree\n\nA binary search tree is a data structure that consists of nodes in a tree-like structure. Each node has a value and two children: left and right. The left child contains a value less than the parent node, and the right child contains a value greater than the parent node.',
		filename: 'data-structures.md',
		createdAt: new Date('2023-04-01'),
	},
	{
		id: '2',
		content:
			'function inOrderTraversal(node) {\n  if (node !== null) {\n    inOrderTraversal(node.left);\n    console.log(node.value);\n    inOrderTraversal(node.right);\n  }\n}',
		filename: 'traversal.js',
		createdAt: new Date('2023-04-02'),
	},
	{
		id: '3',
		content: 'This is a source without a filename or tag.',
		createdAt: new Date('2023-04-03'),
	},
];

const meta: Meta<typeof SourcesList> = {
	title: 'Organisms/SourcesList',
	component: SourcesList,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		sources: { control: 'object' },
		onAddSource: { action: 'onAddSource' },
		onUpdateSource: { action: 'onUpdateSource' },
		onDeleteSource: { action: 'onDeleteSource' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof SourcesList>;

export const Default: Story = {
	args: {
		sources: mockSources,
		onAddSource: fn(),
		onUpdateSource: fn(),
		onDeleteSource: fn(),
	},
};

export const EmptySources: Story = {
	args: {
		sources: [],
		onAddSource: fn(),
		onUpdateSource: fn(),
		onDeleteSource: fn(),
	},
};

export const WithCustomClass: Story = {
	args: {
		sources: mockSources,
		onAddSource: fn(),
		onUpdateSource: fn(),
		onDeleteSource: fn(),
		className: 'border border-primary rounded-md',
	},
};
