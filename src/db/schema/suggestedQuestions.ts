import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { notebooks } from './notebooks';

export const suggestedQuestions = pgTable('suggested_questions', {
	id: text('id').primaryKey(),
	text: text('text').notNull(),
	notebookId: text('notebook_id')
		.notNull()
		.references(() => notebooks.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull(),
});

export type SuggestedQuestion = typeof suggestedQuestions.$inferSelect;
export type InsertSuggestedQuestion = typeof suggestedQuestions.$inferInsert;
