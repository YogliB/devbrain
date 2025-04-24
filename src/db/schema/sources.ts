import { pgTable, text, timestamp, index, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { notebooks } from './notebooks';
import { users } from './users';

export const sources = pgTable(
	'sources',
	{
		id: text('id').primaryKey(),
		content: text('content').notNull(),
		filename: text('filename'),
		tag: text('tag'),
		notebookId: text('notebook_id')
			.notNull()
			.references(() => notebooks.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull(),
	},
	(table) => {
		return {
			notebookIdIdx: index('sources_notebook_id_idx').on(
				table.notebookId,
			),
			userIdIdx: index('sources_user_id_idx').on(table.userId),
			createdAtIdx: index('sources_created_at_idx').on(table.createdAt),
			tagIdx: index('sources_tag_idx').on(table.tag),
			// Add RLS policies to restrict access to user's own sources
			userSelectPolicy: pgPolicy('sources_user_select_policy', {
				for: 'select',
				to: 'public',
				using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
			}),
			userInsertPolicy: pgPolicy('sources_user_insert_policy', {
				for: 'insert',
				to: 'public',
				withCheck: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
			}),
			userUpdatePolicy: pgPolicy('sources_user_update_policy', {
				for: 'update',
				to: 'public',
				using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
				withCheck: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
			}),
			userDeletePolicy: pgPolicy('sources_user_delete_policy', {
				for: 'delete',
				to: 'public',
				using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
			}),
		};
	},
);

export type Source = typeof sources.$inferSelect;
export type InsertSource = typeof sources.$inferInsert;
