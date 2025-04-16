"use client";

import { useState } from 'react';
import { MainLayout } from '@/components/templates/main-layout';
import { Notebook } from '@/types/notebook';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Source } from '@/types/source';
import { Model } from '@/types/model';

// Mock data for demonstration
const mockNotebooks: Notebook[] = [
	{
		id: '1',
		title: 'Project Ideas',
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-05'),
	},
	{
		id: '2',
		title: 'Learning Notes',
		createdAt: new Date('2023-02-01'),
		updatedAt: new Date('2023-02-10'),
	},
	{
		id: '3',
		title: 'Code Snippets',
		createdAt: new Date('2023-03-01'),
		updatedAt: new Date('2023-03-15'),
	},
];

const mockMessages: ChatMessage[] = [
	{
		id: '1',
		content: 'How can I implement a binary search tree in JavaScript?',
		role: 'user',
		timestamp: new Date('2023-04-01T10:00:00'),
	},
	{
		id: '2',
		content:
			'Here\'s how you can implement a binary search tree in JavaScript:\n\n```javascript\nclass Node {\n  constructor(value) {\n    this.value = value;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nclass BinarySearchTree {\n  constructor() {\n    this.root = null;\n  }\n  \n  insert(value) {\n    const newNode = new Node(value);\n    \n    if (this.root === null) {\n      this.root = newNode;\n      return this;\n    }\n    \n    let current = this.root;\n    \n    while (true) {\n      if (value === current.value) return undefined;\n      if (value < current.value) {\n        if (current.left === null) {\n          current.left = newNode;\n          return this;\n        }\n        current = current.left;\n      } else {\n        if (current.right === null) {\n          current.right = newNode;\n          return this;\n        }\n        current = current.right;\n      }\n    }\n  }\n}\n```',
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
		text: 'What\'s the time complexity of BST operations?',
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
		createdAt: new Date('2023-03-20'),
	},
	{
		id: '2',
		content:
			'function inOrderTraversal(node) {\n  if (node !== null) {\n    inOrderTraversal(node.left);\n    console.log(node.value);\n    inOrderTraversal(node.right);\n  }\n}',
		filename: 'traversal.js',
		createdAt: new Date('2023-03-25'),
	},
];

const mockModels: Model[] = [
	{
		id: '1',
		name: 'TinyLlama',
		isDownloaded: true,
		parameters: '1.1B',
		size: '600MB',
		useCase: 'Fast responses, lower accuracy',
	},
	{
		id: '2',
		name: 'Mistral',
		isDownloaded: true,
		parameters: '7B',
		size: '4GB',
		useCase: 'Balanced performance and accuracy',
	},
	{
		id: '3',
		name: 'Phi-3',
		isDownloaded: false,
		parameters: '3.8B',
		size: '2.2GB',
		useCase: 'Optimized for coding tasks',
	},
	{
		id: '4',
		name: 'Llama 3',
		isDownloaded: false,
		parameters: '8B',
		size: '4.5GB',
		useCase: 'High accuracy, slower responses',
	},
];

export default function Home() {
	const [notebooks, setNotebooks] = useState<Notebook[]>(mockNotebooks);
	const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(mockNotebooks[0]);
	const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
	const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>(mockSuggestedQuestions);
	const [sources, setSources] = useState<Source[]>(mockSources);
	const [models, setModels] = useState<Model[]>(mockModels);
	const [selectedModel, setSelectedModel] = useState<Model | null>(mockModels.find(m => m.isDownloaded) || null);

	// Notebook handlers
	const handleSelectNotebook = (notebook: Notebook) => {
		setActiveNotebook(notebook);
	};

	const handleCreateNotebook = () => {
		const newNotebook: Notebook = {
			id: `${Date.now()}`,
			title: `New Notebook ${notebooks.length + 1}`,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		setNotebooks([...notebooks, newNotebook]);
		setActiveNotebook(newNotebook);
	};

	const handleDeleteNotebook = (notebook: Notebook) => {
		const updatedNotebooks = notebooks.filter((n) => n.id !== notebook.id);
		setNotebooks(updatedNotebooks);
		if (activeNotebook?.id === notebook.id) {
			setActiveNotebook(updatedNotebooks[0] || null);
		}
	};

	// Chat handlers
	const handleSendMessage = (content: string) => {
		const newMessage: ChatMessage = {
			id: `${Date.now()}`,
			content,
			role: 'user',
			timestamp: new Date(),
		};
		setMessages([...messages, newMessage]);

		// Mock response (in a real app, this would come from the LLM)
		setTimeout(() => {
			const responseMessage: ChatMessage = {
				id: `${Date.now() + 1}`,
				content: `I received your message: "${content}". This is a mock response.`,
				role: 'assistant',
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, responseMessage]);
		}, 1000);
	};

	const handleSelectQuestion = (question: SuggestedQuestion) => {
		handleSendMessage(question.text);
	};

	// Source handlers
	const handleAddSource = (content: string, filename?: string) => {
		const newSource: Source = {
			id: `${Date.now()}`,
			content,
			filename,
			createdAt: new Date(),
		};
		setSources([...sources, newSource]);
	};

	const handleUpdateSource = (source: Source, content: string) => {
		const updatedSources = sources.map((s) =>
			s.id === source.id ? { ...s, content } : s,
		);
		setSources(updatedSources);
	};

	const handleDeleteSource = (source: Source) => {
		const updatedSources = sources.filter((s) => s.id !== source.id);
		setSources(updatedSources);
	};

	// Model handlers
	const handleSelectModel = (model: Model) => {
		setSelectedModel(model);
	};

	const handleDownloadModel = (model: Model) => {
		// Mock download - in a real app, this would trigger an actual download
		setTimeout(() => {
			const updatedModels = models.map((m) =>
				m.id === model.id ? { ...m, isDownloaded: true } : m,
			);
			setModels(updatedModels);
			setSelectedModel(model);
		}, 2000);
	};

	return (
		<MainLayout
			notebooks={notebooks}
			activeNotebook={activeNotebook}
			messages={messages}
			suggestedQuestions={suggestedQuestions}
			sources={sources}
			models={models}
			selectedModel={selectedModel}
			onSelectNotebook={handleSelectNotebook}
			onCreateNotebook={handleCreateNotebook}
			onDeleteNotebook={handleDeleteNotebook}
			onSendMessage={handleSendMessage}
			onSelectQuestion={handleSelectQuestion}
			onAddSource={handleAddSource}
			onUpdateSource={handleUpdateSource}
			onDeleteSource={handleDeleteSource}
			onSelectModel={handleSelectModel}
			onDownloadModel={handleDownloadModel}
		/>
	);
}
