import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const sources = sqliteTable('sources', {
	id: text('id').primaryKey(),
	content: text('content').notNull(),
	filename: text('filename'),
	tag: text('tag'),
	notebookId: text('notebook_id')
		.notNull()
		.references(() => notebooks.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

import { notebooks } from './notebooks';

export type Source = typeof sources.$inferSelect;
export type InsertSource = typeof sources.$inferInsert;
