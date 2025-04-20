import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const notebooks = pgTable('notebooks', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
});

export type Notebook = typeof notebooks.$inferSelect;
export type InsertNotebook = typeof notebooks.$inferInsert;
