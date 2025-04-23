import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { notebooks } from './notebooks';

export const messages = pgTable(
	'messages',
	{
		id: text('id').primaryKey(),
		content: text('content').notNull(),
		role: text('role', { enum: ['user', 'assistant'] }).notNull(),
		notebookId: text('notebook_id')
			.notNull()
			.references(() => notebooks.id, { onDelete: 'cascade' }),
		timestamp: timestamp('timestamp').notNull(),
	},
	(table) => {
		return {
			notebookIdIdx: index('messages_notebook_id_idx').on(
				table.notebookId,
			),
			timestampIdx: index('messages_timestamp_idx').on(table.timestamp),
		};
	},
);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
