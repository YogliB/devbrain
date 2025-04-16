const Database = require('better-sqlite3');
const { join } = require('path');

const dbPath = join(process.cwd(), 'devbrain.db');
const db = new Database(dbPath);

console.log('Seeding database...');

const modelsCount = db.prepare('SELECT COUNT(*) as count FROM models').get();

if (modelsCount.count === 0) {
	console.log('Seeding models...');

	const stmt = db.prepare(`
    INSERT INTO models (id, name, parameters, size, use_case)
    VALUES (?, ?, ?, ?, ?)
  `);

	const models = [
		{
			id: '1',
			name: 'TinyLlama',
			parameters: '1.1B',
			size: '600MB',
			useCase: 'Fast responses, lower accuracy',
		},
		{
			id: '2',
			name: 'Mistral',
			parameters: '7B',
			size: '4GB',
			useCase: 'Balanced performance and accuracy',
		},
		{
			id: '3',
			name: 'Phi-3',
			parameters: '3.8B',
			size: '2.2GB',
			useCase: 'Optimized for coding tasks',
		},
		{
			id: '4',
			name: 'Llama 3',
			parameters: '8B',
			size: '4.5GB',
			useCase: 'High accuracy, slower responses',
		},
	];

	for (const model of models) {
		stmt.run(
			model.id,
			model.name,
			model.parameters,
			model.size,
			model.useCase,
		);
	}

	console.log('Models seeded successfully');
}

console.log('Database seeding completed');

db.close();
