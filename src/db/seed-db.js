const Database = require('better-sqlite3');
const { join } = require('path');

const dbPath = join(process.cwd(), 'devbrain.db');
const db = new Database(dbPath);

console.log('Seeding database...');

const modelsCount = db.prepare('SELECT COUNT(*) as count FROM models').get();

if (modelsCount.count === 0) {
	console.log('Seeding models...');

	const stmt = db.prepare(`
    INSERT INTO models (id, name, is_downloaded, parameters, size, use_case)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

	const models = [
		{
			id: '1',
			name: 'TinyLlama',
			isDownloaded: 1,
			parameters: '1.1B',
			size: '600MB',
			useCase: 'Fast responses, lower accuracy',
		},
		{
			id: '2',
			name: 'Mistral',
			isDownloaded: 1,
			parameters: '7B',
			size: '4GB',
			useCase: 'Balanced performance and accuracy',
		},
		{
			id: '3',
			name: 'Phi-3',
			isDownloaded: 0,
			parameters: '3.8B',
			size: '2.2GB',
			useCase: 'Optimized for coding tasks',
		},
		{
			id: '4',
			name: 'Llama 3',
			isDownloaded: 0,
			parameters: '8B',
			size: '4.5GB',
			useCase: 'High accuracy, slower responses',
		},
	];

	for (const model of models) {
		stmt.run(
			model.id,
			model.name,
			model.isDownloaded,
			model.parameters,
			model.size,
			model.useCase,
		);
	}

	console.log('Models seeded successfully');
}

const notebooksCount = db
	.prepare('SELECT COUNT(*) as count FROM notebooks')
	.get();

if (notebooksCount.count === 0) {
	console.log('Seeding sample notebook...');

	const notebookId = '1';
	const now = Math.floor(Date.now() / 1000);

	db.prepare(
		`
    INSERT INTO notebooks (id, title, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `,
	).run(notebookId, 'Sample Notebook', now, now);

	const sourceStmt = db.prepare(`
    INSERT INTO sources (id, content, filename, notebook_id, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

	sourceStmt.run(
		'1',
		'# Binary Search Tree\n\nA binary search tree is a data structure that consists of nodes in a tree-like structure. Each node has a value and two children: left and right. The left child contains a value less than the parent node, and the right child contains a value greater than the parent node.',
		'data-structures.md',
		notebookId,
		now,
	);

	sourceStmt.run(
		'2',
		'function inOrderTraversal(node) {\n  if (node !== null) {\n    inOrderTraversal(node.left);\n    console.log(node.value);\n    inOrderTraversal(node.right);\n  }\n}',
		'traversal.js',
		notebookId,
		now,
	);

	const messageStmt = db.prepare(`
    INSERT INTO messages (id, content, role, notebook_id, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);

	messageStmt.run(
		'1',
		'How can I implement a binary search tree in JavaScript?',
		'user',
		notebookId,
		Math.floor(new Date('2023-04-01T10:00:00').getTime() / 1000),
	);

	messageStmt.run(
		'2',
		"Here's how you can implement a binary search tree in JavaScript:\n\n```javascript\nclass Node {\n  constructor(value) {\n    this.value = value;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nclass BinarySearchTree {\n  constructor() {\n    this.root = null;\n  }\n  \n  insert(value) {\n    const newNode = new Node(value);\n    \n    if (this.root === null) {\n      this.root = newNode;\n      return this;\n    }\n    \n    let current = this.root;\n    \n    while (true) {\n      if (value === current.value) return undefined;\n      if (value < current.value) {\n        if (current.left === null) {\n          current.left = newNode;\n          return this;\n        }\n        current = current.left;\n      } else {\n        if (current.right === null) {\n          current.right = newNode;\n          return this;\n        }\n        current = current.right;\n      }\n    }\n  }\n}\n```",
		'assistant',
		notebookId,
		Math.floor(new Date('2023-04-01T10:01:00').getTime() / 1000),
	);

	console.log('Sample notebook seeded successfully');
}

console.log('Database seeding completed');

db.close();
