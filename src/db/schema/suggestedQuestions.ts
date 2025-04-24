import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
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
	(table) => {
		return {
			notebookIdIdx: index('suggested_questions_notebook_id_idx').on(
				table.notebookId,
			),
			userIdIdx: index('suggested_questions_user_id_idx').on(
				table.userId,
			),
			createdAtIdx: index('suggested_questions_created_at_idx').on(
				table.createdAt,
			),
		};
	},
);

export type SuggestedQuestion = typeof suggestedQuestions.$inferSelect;
export type InsertSuggestedQuestion = typeof suggestedQuestions.$inferInsert;
