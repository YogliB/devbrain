import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessage } from './chat-message';
import { ChatMessage as ChatMessageType } from '@/types/chat';

// Mock data
const userMessage: ChatMessageType = {
	id: '1',
	content: 'How do I implement a binary search tree in JavaScript?',
	role: 'user',
	timestamp: new Date(),
};

const assistantMessage: ChatMessageType = {
	id: '2',
	content:
		"A binary search tree (BST) is a data structure where each node has at most two children, with all nodes in the left subtree having values less than the node, and all nodes in the right subtree having values greater than the node.\n\nHere's a simple implementation in JavaScript:\n\n```javascript\nclass Node {\n  constructor(value) {\n    this.value = value;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nclass BinarySearchTree {\n  constructor() {\n    this.root = null;\n  }\n  \n  insert(value) {\n    const newNode = new Node(value);\n    \n    if (this.root === null) {\n      this.root = newNode;\n      return this;\n    }\n    \n    let current = this.root;\n    \n    while (true) {\n      if (value === current.value) return undefined;\n      if (value < current.value) {\n        if (current.left === null) {\n          current.left = newNode;\n          return this;\n        }\n        current = current.left;\n      } else {\n        if (current.right === null) {\n          current.right = newNode;\n          return this;\n        }\n        current = current.right;\n      }\n    }\n  }\n}\n```",
	role: 'assistant',
	timestamp: new Date(),
};

const meta: Meta<typeof ChatMessage> = {
	title: 'Molecules/ChatMessage',
	component: ChatMessage,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		message: { control: 'object' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof ChatMessage>;

export const UserMessage: Story = {
	args: {
		message: userMessage,
	},
};

export const AssistantMessage: Story = {
	args: {
		message: assistantMessage,
	},
};

export const WithCustomClass: Story = {
	args: {
		message: userMessage,
		className: 'border border-primary rounded-md',
	},
};
