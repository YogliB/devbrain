import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { notebooks } from './notebooks';

export const suggestedQuestions = sqliteTable('suggested_questions', {
	id: text('id').primaryKey(),
	text: text('text').notNull(),
	notebookId: text('notebook_id')
		.notNull()
		.references(() => notebooks.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type SuggestedQuestion = typeof suggestedQuestions.$inferSelect;
export type InsertSuggestedQuestion = typeof suggestedQuestions.$inferInsert;
