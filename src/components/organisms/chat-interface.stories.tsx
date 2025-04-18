import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ChatInterface } from './chat-interface';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';

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

  find(value) {
    if (!this.root) return null;

    let current = this.root;
    let found = false;

    while (current && !found) {
      if (value < current.value) {
        current = current.left;
      } else if (value > current.value) {
        current = current.right;
      } else {
        found = true;
      }
    }

    if (!found) return null;
    return current;
  }
}
\`\`\`

You can use it like this:

\`\`\`javascript
const bst = new BinarySearchTree();
bst.insert(10);
bst.insert(5);
bst.insert(15);
bst.insert(2);
bst.insert(7);
\`\`\``,
		role: 'assistant',
		timestamp: new Date('2023-04-01T10:01:00'),
	},
	{
		id: '3',
		content: 'How would I traverse this tree in-order?',
		role: 'user',
		timestamp: new Date('2023-04-01T10:02:00'),
	},
	{
		id: '4',
		content: `In-order traversal visits nodes in ascending order in a BST: left subtree, current node, then right subtree.

Here's how to add an in-order traversal method to your BST class:

\`\`\`javascript
inOrderTraversal(node = this.root, callback) {
  if (node) {
    // First traverse left subtree
    this.inOrderTraversal(node.left, callback);

    // Then visit the node
    if (callback) callback(node.value);

    // Finally traverse right subtree
    this.inOrderTraversal(node.right, callback);
  }
}
\`\`\`

You can use it like this:

\`\`\`javascript
const values = [];
bst.inOrderTraversal(bst.root, (value) => values.push(value));
console.log(values); // [2, 5, 7, 10, 15]
\`\`\`

This will print the values in ascending order.`,
		role: 'assistant',
		timestamp: new Date('2023-04-01T10:03:00'),
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

const meta: Meta<typeof ChatInterface> = {
	title: 'Organisms/ChatInterface',
	component: ChatInterface,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		messages: { control: 'object' },
		suggestedQuestions: { control: 'object' },
		onSendMessage: { action: 'onSendMessage' },
		onSelectQuestion: { action: 'onSelectQuestion' },
		onClearMessages: { action: 'onClearMessages' },
		disabled: { control: 'boolean' },
		modelAvailable: { control: 'boolean' },
		isGenerating: { control: 'boolean' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof ChatInterface>;

export const Default: Story = {
	args: {
		messages: mockMessages,
		suggestedQuestions: mockSuggestedQuestions,
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		disabled: false,
		modelAvailable: true,
		isGenerating: false,
	},
};

export const EmptyChat: Story = {
	args: {
		messages: [],
		suggestedQuestions: mockSuggestedQuestions,
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		disabled: false,
		modelAvailable: true,
		isGenerating: false,
	},
};

export const Disabled: Story = {
	args: {
		messages: [],
		suggestedQuestions: mockSuggestedQuestions,
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		disabled: true,
		modelAvailable: true,
		isGenerating: false,
	},
};

export const NoModelAvailable: Story = {
	args: {
		messages: [],
		suggestedQuestions: mockSuggestedQuestions,
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		disabled: false,
		modelAvailable: false,
		isGenerating: false,
	},
};

export const IsGenerating: Story = {
	args: {
		messages: mockMessages,
		suggestedQuestions: mockSuggestedQuestions,
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		disabled: false,
		modelAvailable: true,
		isGenerating: true,
	},
};

export const WithThinkingMessage: Story = {
	args: {
		messages: [
			...mockMessages,
			{
				id: 'thinking-1',
				content: '',
				role: 'assistant',
				timestamp: new Date(),
				isThinking: true,
			},
		],
		suggestedQuestions: mockSuggestedQuestions,
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		disabled: false,
		modelAvailable: true,
		isGenerating: true,
	},
};

export const WithCustomClass: Story = {
	args: {
		messages: mockMessages,
		suggestedQuestions: mockSuggestedQuestions,
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		disabled: false,
		modelAvailable: true,
		isGenerating: false,
		className: 'border border-primary rounded-md',
	},
};
