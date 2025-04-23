import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';

export const notebooks = pgTable(
	'notebooks',
	{
		id: text('id').primaryKey(),
		title: text('title').notNull(),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at').notNull(),
	},
	(table) => {
		return {
			updatedAtIdx: index('notebooks_updated_at_idx').on(table.updatedAt),
		};
	},
);

export type Notebook = typeof notebooks.$inferSelect;
export type InsertNotebook = typeof notebooks.$inferInsert;
