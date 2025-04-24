import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
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
		};
	},
);

export type Source = typeof sources.$inferSelect;
export type InsertSource = typeof sources.$inferInsert;
