import { initDb } from './index';
import { notebooks, sources, messages, models } from './schema';

async function seed() {
	console.log('Seeding database...');

	// Initialize the database (runs migrations)
	const db = await initDb();

	// Seed models
	const existingModels = await db.select().from(models);

	if (existingModels.length === 0) {
		await db.insert(models).values([
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
		]);

		console.log('Seeded models');
	}

	// Seed a sample notebook if none exist
	const existingNotebooks = await db.select().from(notebooks);

	if (existingNotebooks.length === 0) {
		const notebookId = '1';

		// Insert notebook
		await db.insert(notebooks).values({
			id: notebookId,
			title: 'Sample Notebook',
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Insert sources
		await db.insert(sources).values([
			{
				id: '1',
				content:
					'# Binary Search Tree\n\nA binary search tree is a data structure that consists of nodes in a tree-like structure. Each node has a value and two children: left and right. The left child contains a value less than the parent node, and the right child contains a value greater than the parent node.',
				filename: 'data-structures.md',
				notebookId,
				createdAt: new Date(),
			},
			{
				id: '2',
				content:
					'function inOrderTraversal(node) {\n  if (node !== null) {\n    inOrderTraversal(node.left);\n    console.log(node.value);\n    inOrderTraversal(node.right);\n  }\n}',
				filename: 'traversal.js',
				notebookId,
				createdAt: new Date(),
			},
		]);

		// Insert messages
		await db.insert(messages).values([
			{
				id: '1',
				content:
					'How can I implement a binary search tree in JavaScript?',
				role: 'user',
				notebookId,
				timestamp: new Date('2023-04-01T10:00:00'),
			},
			{
				id: '2',
				content:
					"Here's how you can implement a binary search tree in JavaScript:\n\n```javascript\nclass Node {\n  constructor(value) {\n    this.value = value;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nclass BinarySearchTree {\n  constructor() {\n    this.root = null;\n  }\n  \n  insert(value) {\n    const newNode = new Node(value);\n    \n    if (this.root === null) {\n      this.root = newNode;\n      return this;\n    }\n    \n    let current = this.root;\n    \n    while (true) {\n      if (value === current.value) return undefined;\n      if (value < current.value) {\n        if (current.left === null) {\n          current.left = newNode;\n          return this;\n        }\n        current = current.left;\n      } else {\n        if (current.right === null) {\n          current.right = newNode;\n          return this;\n        }\n        current = current.right;\n      }\n    }\n  }\n}\n```",
				role: 'assistant',
				notebookId,
				timestamp: new Date('2023-04-01T10:01:00'),
			},
		]);

		console.log('Seeded sample notebook with sources and messages');
	}

	console.log('Database seeding completed');
}

seed().catch((e) => {
	console.error('Seeding failed');
	console.error(e);
	process.exit(1);
});
