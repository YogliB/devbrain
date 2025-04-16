import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const models = sqliteTable('models', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	parameters: text('parameters').notNull(),
	size: text('size').notNull(),
	useCase: text('use_case').notNull(),
	webLLMId: text('web_llm_id'),
});

export type Model = typeof models.$inferSelect;
export type InsertModel = typeof models.$inferInsert;
