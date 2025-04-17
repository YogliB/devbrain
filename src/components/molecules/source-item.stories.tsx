import type { Meta, StoryObj } from '@storybook/react';
import { SourceItem } from './source-item';
import { Source } from '@/types/source';

// Mock data
const markdownSource: Source = {
	id: '1',
	content:
		'# Binary Search Tree\n\nA binary search tree is a data structure that consists of nodes in a tree-like structure. Each node has a value and two children: left and right. The left child contains a value less than the parent node, and the right child contains a value greater than the parent node.',
	filename: 'data-structures.md',
	createdAt: new Date(),
};

const codeSource: Source = {
	id: '2',
	content:
		'function inOrderTraversal(node) {\n  if (node !== null) {\n    inOrderTraversal(node.left);\n    console.log(node.value);\n    inOrderTraversal(node.right);\n  }\n}',
	filename: 'traversal.js',
	createdAt: new Date(),
};

const sourceWithoutFilename: Source = {
	id: '3',
	content: 'This is a source without a filename or tag.',
	createdAt: new Date(),
};

const meta: Meta<typeof SourceItem> = {
	title: 'Molecules/SourceItem',
	component: SourceItem,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		source: { control: 'object' },
		onUpdate: { action: 'onUpdate' },
		onDelete: { action: 'onDelete' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof SourceItem>;

export const MarkdownSource: Story = {
	args: {
		source: markdownSource,
	},
};

export const CodeSource: Story = {
	args: {
		source: codeSource,
	},
};

export const SourceWithoutFilename: Story = {
	args: {
		source: sourceWithoutFilename,
	},
};

export const WithCustomClass: Story = {
	args: {
		source: markdownSource,
		className: 'max-w-md',
	},
};
