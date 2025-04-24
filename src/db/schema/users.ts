import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

export const users = pgTable(
	'users',
	{
		id: text('id').primaryKey(),
		email: text('email').notNull().unique(),
		password: text('password').notNull(),
		name: text('name'),
		isGuest: boolean('is_guest').notNull().default(false),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at').notNull(),
	},
	(table) => ({
		emailIdx: index('users_email_idx').on(table.email),
		createdAtIdx: index('users_created_at_idx').on(table.createdAt),
	}),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
