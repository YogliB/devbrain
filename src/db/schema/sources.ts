import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { notebooks } from './notebooks';

export const sources = pgTable('sources', {
	id: text('id').primaryKey(),
	content: text('content').notNull(),
	filename: text('filename'),
	tag: text('tag'),
	notebookId: text('notebook_id')
		.notNull()
		.references(() => notebooks.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull(),
});

export type Source = typeof sources.$inferSelect;
export type InsertSource = typeof sources.$inferInsert;
