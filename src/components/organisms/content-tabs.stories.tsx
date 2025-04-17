import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ContentTabs } from './content-tabs';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Source } from '@/types/source';
import { ModelContextDecorator } from '../../../.storybook/model-context-decorator';

// Mock data
const mockMessages: ChatMessage[] = [
	{
		id: '1',
		content: 'How do I implement a binary search tree in JavaScript?',
		role: 'user',
		timestamp: new Date('2023-04-01T10:00:00'),
	},
	{
		id: '2',
		content: `A binary search tree (BST) is a data structure where each node has at most two children, with all values in the left subtree less than the node's value, and all values in the right subtree greater.

Here's a simple implementation in JavaScript:

\`\`\`javascript
class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const newNode = new Node(value);

    if (!this.root) {
      this.root = newNode;
      return this;
    }

    let current = this.root;

    while (true) {
      if (value === current.value) return this;

      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }
}
\`\`\``,
		role: 'assistant',
		timestamp: new Date('2023-04-01T10:01:00'),
	},
];

const mockSuggestedQuestions: SuggestedQuestion[] = [
	{
		id: '1',
		text: 'How do I balance a binary search tree?',
	},
	{
		id: '2',
		text: "What's the time complexity of BST operations?",
	},
	{
		id: '3',
		text: 'Can you show me a tree traversal example?',
	},
];

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
];

const meta: Meta<typeof ContentTabs> = {
	title: 'Organisms/ContentTabs',
	component: ContentTabs,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	decorators: [ModelContextDecorator],
	argTypes: {
		messages: { control: 'object' },
		suggestedQuestions: { control: 'object' },
		sources: { control: 'object' },
		onSendMessage: { action: 'onSendMessage' },
		onSelectQuestion: { action: 'onSelectQuestion' },
		onClearMessages: { action: 'onClearMessages' },
		onAddSource: { action: 'onAddSource' },
		onUpdateSource: { action: 'onUpdateSource' },
		onDeleteSource: { action: 'onDeleteSource' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof ContentTabs>;

export const Default: Story = {
	args: {
		messages: mockMessages,
		suggestedQuestions: mockSuggestedQuestions,
		sources: mockSources,
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		onAddSource: fn(),
		onUpdateSource: fn(),
		onDeleteSource: fn(),
	},
};

export const EmptyMessages: Story = {
	args: {
		messages: [],
		suggestedQuestions: mockSuggestedQuestions,
		sources: mockSources,
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		onAddSource: fn(),
		onUpdateSource: fn(),
		onDeleteSource: fn(),
	},
};

export const EmptySources: Story = {
	args: {
		messages: mockMessages,
		suggestedQuestions: mockSuggestedQuestions,
		sources: [],
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		onAddSource: fn(),
		onUpdateSource: fn(),
		onDeleteSource: fn(),
	},
};

export const EmptyEverything: Story = {
	args: {
		messages: [],
		suggestedQuestions: [],
		sources: [],
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		onAddSource: fn(),
		onUpdateSource: fn(),
		onDeleteSource: fn(),
	},
};

export const WithCustomClass: Story = {
	args: {
		messages: mockMessages,
		suggestedQuestions: mockSuggestedQuestions,
		sources: mockSources,
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		onAddSource: fn(),
		onUpdateSource: fn(),
		onDeleteSource: fn(),
		className: 'border border-primary rounded-md',
	},
};
