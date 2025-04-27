import {
	pgTable,
	text,
	timestamp,
	integer,
	index,
	pgPolicy,
	jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { sources } from './sources';
import { users } from './users';
import { notebooks } from './notebooks';

export const sourceChunks = pgTable(
	'source_chunks',
	{
		id: text('id').primaryKey(),
		content: text('content').notNull(),
		chunkIndex: integer('chunk_index').notNull(),
		metadata: jsonb('metadata'),
		sourceId: text('source_id')
			.notNull()
			.references(() => sources.id, { onDelete: 'cascade' }),
		notebookId: text('notebook_id')
			.notNull()
			.references(() => notebooks.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull(),
	},
	(table) => ({
		sourceIdIdx: index('source_chunks_source_id_idx').on(table.sourceId),
		notebookIdIdx: index('source_chunks_notebook_id_idx').on(
			table.notebookId,
		),
		userIdIdx: index('source_chunks_user_id_idx').on(table.userId),
		createdAtIdx: index('source_chunks_created_at_idx').on(table.createdAt),
		// Add RLS policies to restrict access to user's own source chunks
		userSelectPolicy: pgPolicy('source_chunks_user_select_policy', {
			for: 'select',
			to: 'public',
			using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
		userInsertPolicy: pgPolicy('source_chunks_user_insert_policy', {
			for: 'insert',
			to: 'public',
			withCheck: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
		userUpdatePolicy: pgPolicy('source_chunks_user_update_policy', {
			for: 'update',
			to: 'public',
			using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
		userDeletePolicy: pgPolicy('source_chunks_user_delete_policy', {
			for: 'delete',
			to: 'public',
			using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
	}),
);

export const sourceEmbeddings = pgTable(
	'source_embeddings',
	{
		id: text('id').primaryKey(),
		chunkId: text('chunk_id')
			.notNull()
			.references(() => sourceChunks.id, { onDelete: 'cascade' }),
		// Define a custom column for the vector
		// This is a workaround for TypeScript type issues
		embedding: text('embedding').notNull(),
		sourceId: text('source_id')
			.notNull()
			.references(() => sources.id, { onDelete: 'cascade' }),
		notebookId: text('notebook_id')
			.notNull()
			.references(() => notebooks.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull(),
	},
	(table) => ({
		chunkIdIdx: index('source_embeddings_chunk_id_idx').on(table.chunkId),
		sourceIdIdx: index('source_embeddings_source_id_idx').on(
			table.sourceId,
		),
		notebookIdIdx: index('source_embeddings_notebook_id_idx').on(
			table.notebookId,
		),
		userIdIdx: index('source_embeddings_user_id_idx').on(table.userId),
		// Create a vector index for similarity search
		embeddingIdx: sql`CREATE INDEX IF NOT EXISTS source_embeddings_embedding_idx ON source_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`,
		// Add RLS policies to restrict access to user's own embeddings
		userSelectPolicy: pgPolicy('source_embeddings_user_select_policy', {
			for: 'select',
			to: 'public',
			using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
		userInsertPolicy: pgPolicy('source_embeddings_user_insert_policy', {
			for: 'insert',
			to: 'public',
			withCheck: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
		userDeletePolicy: pgPolicy('source_embeddings_user_delete_policy', {
			for: 'delete',
			to: 'public',
			using: sql`${table.userId} = current_setting('app.current_user_id', true)::text`,
		}),
	}),
);

export type SourceChunk = typeof sourceChunks.$inferSelect;
export type InsertSourceChunk = typeof sourceChunks.$inferInsert;

export type SourceEmbedding = typeof sourceEmbeddings.$inferSelect;
export type InsertSourceEmbedding = typeof sourceEmbeddings.$inferInsert;
