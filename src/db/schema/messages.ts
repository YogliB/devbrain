import { pgTable, text, timestamp, index, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { notebooks } from './notebooks';
import { users } from './users';

export const messages = pgTable(
	'messages',
	{
		id: text('id').primaryKey(),
		content: text('content').notNull(),
		role: text('role', { enum: ['user', 'assistant'] }).notNull(),
		notebookId: text('notebook_id')
			.notNull()
			.references(() => notebooks.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		timestamp: timestamp('timestamp').notNull(),
	},
	(table) => {
		return {
			notebookIdIdx: index('messages_notebook_id_idx').on(
				table.notebookId,
			),
			userIdIdx: index('messages_user_id_idx').on(table.userId),
			timestampIdx: index('messages_timestamp_idx').on(table.timestamp),
			// Add RLS policies to restrict access to user's own messages
			userSelectPolicy: pgPolicy('messages_user_select_policy', {
				for: 'select',
				to: 'public',
				using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
			}),
			userInsertPolicy: pgPolicy('messages_user_insert_policy', {
				for: 'insert',
				to: 'public',
				withCheck: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
			}),
			userUpdatePolicy: pgPolicy('messages_user_update_policy', {
				for: 'update',
				to: 'public',
				using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
				withCheck: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
			}),
			userDeletePolicy: pgPolicy('messages_user_delete_policy', {
				for: 'delete',
				to: 'public',
				using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
			}),
		};
	},
);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
