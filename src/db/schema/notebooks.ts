import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notebooks = pgTable(
	'notebooks',
	{
		id: text('id').primaryKey(),
		title: text('title').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at').notNull(),
	},
	(table) => ({
		updatedAtIdx: index('notebooks_updated_at_idx').on(table.updatedAt),
		userIdIdx: index('notebooks_user_id_idx').on(table.userId),
	}),
);

export type Notebook = typeof notebooks.$inferSelect;
export type InsertNotebook = typeof notebooks.$inferInsert;
