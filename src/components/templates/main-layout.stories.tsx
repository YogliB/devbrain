import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { MainLayout } from './main-layout';
import { Notebook } from '@/types/notebook';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Source } from '@/types/source';

// Mock data
const mockNotebooks: Notebook[] = [
	{
		id: '1',
		title: 'JavaScript Algorithms',
		createdAt: new Date('2023-04-01T09:00:00'),
		updatedAt: new Date('2023-04-01T09:00:00'),
	},
	{
		id: '2',
		title: 'React Hooks',
		createdAt: new Date('2023-04-02T10:00:00'),
		updatedAt: new Date('2023-04-02T10:00:00'),
	},
	{
		id: '3',
		title: 'TypeScript Types',
		createdAt: new Date('2023-04-03T11:00:00'),
		updatedAt: new Date('2023-04-03T11:00:00'),
	},
];

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
      if (value === current.value) return undefined;
      
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
    if (!this.root) return false;
    
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
    
    if (!found) return false;
    return current;
  }
}
\`\`\`

This implementation includes the basic structure and methods for inserting and finding values in a BST.`,
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
		content: `class BinarySearchTree {
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
      if (value === current.value) return undefined;
      
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
}`,
		filename: 'bst.js',
		createdAt: new Date('2023-04-01T09:30:00'),
	},
	{
		id: '2',
		content: `function inOrderTraversal(node) {
  if (node) {
    inOrderTraversal(node.left);
    console.log(node.value);
    inOrderTraversal(node.right);
  }
}

function preOrderTraversal(node) {
  if (node) {
    console.log(node.value);
    preOrderTraversal(node.left);
    preOrderTraversal(node.right);
  }
}

function postOrderTraversal(node) {
  if (node) {
    postOrderTraversal(node.left);
    postOrderTraversal(node.right);
    console.log(node.value);
  }
}`,
		filename: 'traversal.js',
		createdAt: new Date('2023-04-01T09:45:00'),
	},
];

const meta: Meta<typeof MainLayout> = {
	title: 'Templates/MainLayout',
	component: MainLayout,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
	argTypes: {
		notebooks: { control: 'object' },
		activeNotebook: { control: 'object' },
		messages: { control: 'object' },
		suggestedQuestions: { control: 'object' },
		sources: { control: 'object' },
		isLoading: { control: 'boolean' },
		isGenerating: { control: 'boolean' },
		isGeneratingQuestions: { control: 'boolean' },
		modelAvailable: { control: 'boolean' },
		onSelectNotebook: { action: 'onSelectNotebook' },
		onCreateNotebook: { action: 'onCreateNotebook' },
		onDeleteNotebook: { action: 'onDeleteNotebook' },
		onSendMessage: { action: 'onSendMessage' },
		onSelectQuestion: { action: 'onSelectQuestion' },
		onClearMessages: { action: 'onClearMessages' },
		onRegenerateQuestions: { action: 'onRegenerateQuestions' },
		onAddSource: { action: 'onAddSource' },
		onUpdateSource: { action: 'onUpdateSource' },
		onDeleteSource: { action: 'onDeleteSource' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof MainLayout>;

export const Default: Story = {
	args: {
		notebooks: mockNotebooks,
		activeNotebook: mockNotebooks[0],
		messages: mockMessages,
		suggestedQuestions: mockSuggestedQuestions,
		sources: mockSources,
		isLoading: false,
		isGenerating: false,
		isGeneratingQuestions: false,
		modelAvailable: true,
		onSelectNotebook: fn(),
		onCreateNotebook: fn(),
		onDeleteNotebook: fn(),
		onSendMessage: fn(),
		onSelectQuestion: fn(),
		onClearMessages: fn(),
		onRegenerateQuestions: fn(),
		onAddSource: fn(),
		onUpdateSource: fn(),
		onDeleteSource: fn(),
	},
};

export const Loading: Story = {
	args: {
		...Default.args,
		isLoading: true,
	},
};

export const EmptyNotebooks: Story = {
	args: {
		...Default.args,
		notebooks: [],
		activeNotebook: null,
	},
};

export const WithActiveNotebookNoMessages: Story = {
	args: {
		...Default.args,
		messages: [],
	},
};

export const GeneratingResponse: Story = {
	args: {
		...Default.args,
		isGenerating: true,
	},
};

export const GeneratingQuestions: Story = {
	args: {
		...Default.args,
		isGeneratingQuestions: true,
	},
};

export const ModelUnavailable: Story = {
	args: {
		...Default.args,
		modelAvailable: false,
	},
};
