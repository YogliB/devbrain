import { pgTable, text, timestamp, index, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { notebooks } from './notebooks';
import { users } from './users';

export const suggestedQuestions = pgTable(
	'suggested_questions',
	{
		id: text('id').primaryKey(),
		text: text('text').notNull(),
		notebookId: text('notebook_id')
			.notNull()
			.references(() => notebooks.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull(),
	},
	(table) => ({
		notebookIdIdx: index('suggested_questions_notebook_id_idx').on(
			table.notebookId,
		),
		userIdIdx: index('suggested_questions_user_id_idx').on(table.userId),
		createdAtIdx: index('suggested_questions_created_at_idx').on(
			table.createdAt,
		),
		// Add RLS policies to restrict access to user's own suggested questions
		userSelectPolicy: pgPolicy('suggested_questions_user_select_policy', {
			for: 'select',
			to: 'public',
			using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
		userInsertPolicy: pgPolicy('suggested_questions_user_insert_policy', {
			for: 'insert',
			to: 'public',
			withCheck: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
		userUpdatePolicy: pgPolicy('suggested_questions_user_update_policy', {
			for: 'update',
			to: 'public',
			using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
			withCheck: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
		userDeletePolicy: pgPolicy('suggested_questions_user_delete_policy', {
			for: 'delete',
			to: 'public',
			using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
	}),
);

export type SuggestedQuestion = typeof suggestedQuestions.$inferSelect;
export type InsertSuggestedQuestion = typeof suggestedQuestions.$inferInsert;
