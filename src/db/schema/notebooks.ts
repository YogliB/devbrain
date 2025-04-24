import { pgTable, text, timestamp, index, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
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
		// Add RLS policies to restrict access to user's own notebooks
		userSelectPolicy: pgPolicy('notebooks_user_select_policy', {
			for: 'select',
			to: 'public',
			using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
		userInsertPolicy: pgPolicy('notebooks_user_insert_policy', {
			for: 'insert',
			to: 'public',
			withCheck: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
		userUpdatePolicy: pgPolicy('notebooks_user_update_policy', {
			for: 'update',
			to: 'public',
			using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
			withCheck: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
		userDeletePolicy: pgPolicy('notebooks_user_delete_policy', {
			for: 'delete',
			to: 'public',
			using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
	}),
);

export type Notebook = typeof notebooks.$inferSelect;
export type InsertNotebook = typeof notebooks.$inferInsert;
