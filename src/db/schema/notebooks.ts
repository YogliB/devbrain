import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const notebooks = sqliteTable('notebooks', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type Notebook = typeof notebooks.$inferSelect;
export type InsertNotebook = typeof notebooks.$inferInsert;
