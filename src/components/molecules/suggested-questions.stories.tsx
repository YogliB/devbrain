import type { Meta, StoryObj } from '@storybook/react';
import { SuggestedQuestions } from './suggested-questions';
import { SuggestedQuestion } from '@/types/chat';

// Mock data
const mockQuestions: SuggestedQuestion[] = [
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

const meta: Meta<typeof SuggestedQuestions> = {
	title: 'Molecules/SuggestedQuestions',
	component: SuggestedQuestions,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		questions: { control: 'object' },
		onSelectQuestion: { action: 'onSelectQuestion' },
		className: { control: 'text' },
	},
};

export default meta;
type Story = StoryObj<typeof SuggestedQuestions>;

export const Default: Story = {
	args: {
		questions: mockQuestions,
	},
};

export const SingleQuestion: Story = {
	args: {
		questions: [mockQuestions[0]],
	},
};

export const ManyQuestions: Story = {
	args: {
		questions: [
			...mockQuestions,
			{ id: '4', text: 'How do I implement a red-black tree?' },
			{ id: '5', text: 'What are the advantages of AVL trees?' },
			{ id: '6', text: 'How do I convert a BST to a balanced BST?' },
		],
	},
};

export const EmptyQuestions: Story = {
	args: {
		questions: [],
	},
};

export const WithCustomClass: Story = {
	args: {
		questions: mockQuestions,
		className: 'bg-muted p-4 rounded-md',
	},
};
