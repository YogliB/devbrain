import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { notebooks } from './notebooks';

export const messages = sqliteTable('messages', {
	id: text('id').primaryKey(),
	content: text('content').notNull(),
	role: text('role', { enum: ['user', 'assistant'] }).notNull(),
	notebookId: text('notebook_id')
		.notNull()
		.references(() => notebooks.id, { onDelete: 'cascade' }),
	timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
