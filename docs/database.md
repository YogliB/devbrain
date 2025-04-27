# Database Documentation

## Database Management

This project uses PostgreSQL with Drizzle ORM for database management. The database is automatically initialized when running the application, but you can also manually initialize it using the database commands listed below.

### Database Commands

- `npm run db:push` - Apply schema to the database
- `npm run db:studio` - Open Drizzle Studio to view and edit the database
- `npm run db:start` - Start the PostgreSQL Docker container
- `npm run db:stop` - Stop the PostgreSQL Docker container

### PostgreSQL Setup

The project uses a dockerized pgvector/pgvector:pg17 instance (PostgreSQL with pgvector extension for vector storage capabilities). To start the database:

```bash
npm run db:start
```

To stop the database:

```bash
npm run db:stop
```

### Environment Variables

The database connection is configured using environment variables. See `.env.example` for the variables. Make sure to set up the following environment variables in your `.env` file:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=devbrain
POSTGRES_PORT=5433
DATABASE_URL=postgres://postgres:postgres@localhost:5433/devbrain
```

## Database Schema and Indexes

The database schema is defined using Drizzle ORM in the `src/db/schema` directory. The following tables are defined:

- `notebooks` - Stores notebook metadata with user ownership
- `messages` - Stores chat messages associated with notebooks and users
- `sources` - Stores source content associated with notebooks and users
- `sourceChunks` - Stores chunked content from sources for improved retrieval
- `sourceEmbeddings` - Stores vector embeddings of source chunks for similarity search
- `suggestedQuestions` - Stores AI-generated questions for notebooks and users
- `users` - Stores user authentication information

The following indexes are defined to improve query performance:

- `notebooks_updated_at_idx` - Index on the `updatedAt` column of the notebooks table
- `notebooks_user_id_idx` - Index on the `userId` column of the notebooks table
- `messages_notebook_id_idx` - Index on the `notebookId` column of the messages table
- `messages_user_id_idx` - Index on the `userId` column of the messages table
- `messages_timestamp_idx` - Index on the `timestamp` column of the messages table
- `sources_notebook_id_idx` - Index on the `notebookId` column of the sources table
- `sources_user_id_idx` - Index on the `userId` column of the sources table
- `sources_created_at_idx` - Index on the `createdAt` column of the sources table
- `sources_tag_idx` - Index on the `tag` column of the sources table
- `source_chunks_source_id_idx` - Index on the `sourceId` column of the sourceChunks table
- `source_chunks_notebook_id_idx` - Index on the `notebookId` column of the sourceChunks table
- `source_chunks_user_id_idx` - Index on the `userId` column of the sourceChunks table
- `source_embeddings_chunk_id_idx` - Index on the `chunkId` column of the sourceEmbeddings table
- `source_embeddings_source_id_idx` - Index on the `sourceId` column of the sourceEmbeddings table
- `source_embeddings_embedding_idx` - Vector index on the `embedding` column for similarity search
- `suggested_questions_notebook_id_idx` - Index on the `notebookId` column of the suggestedQuestions table
- `suggested_questions_user_id_idx` - Index on the `userId` column of the suggestedQuestions table
- `suggested_questions_created_at_idx` - Index on the `createdAt` column of the suggestedQuestions table
- `users_email_idx` - Index on the `email` column of the users table
- `users_created_at_idx` - Index on the `createdAt` column of the users table

## Data Isolation with Row-Level Security

This project implements data isolation using PostgreSQL's Row-Level Security (RLS) feature through Drizzle ORM. This ensures that each user can only access their own data, even if they share the same database. The implementation includes:

- User ID references in all data tables (notebooks, messages, sources, suggestedQuestions)
- RLS policies that filter data based on the current user ID
- Middleware that sets the current user ID for each database session
- API client that includes the user ID in all requests

The RLS policies are defined directly in the schema using Drizzle's `pgPolicy` API, which automatically enables RLS on the tables. Each table has policies for SELECT, INSERT, UPDATE, and DELETE operations that check if the user ID matches the current user ID set in the database session.

This approach provides a robust security layer at the database level, ensuring that even if there's a bug in the application code, users cannot access data they shouldn't have access to.

## Database Initialization

The database is initialized using the `initDb` function in `src/db/index.ts`. This function:

1. Establishes a connection to the PostgreSQL database
2. Sets up the necessary configuration for Row-Level Security
3. Returns a Drizzle ORM instance that can be used to interact with the database

The database connection is managed using a middleware (`withDb`) that ensures the connection is properly closed after each request.

## Database Schema Structure

The database schema is organized into separate files for each table:

- `src/db/schema/notebooks.ts` - Defines the notebooks table
- `src/db/schema/messages.ts` - Defines the messages table
- `src/db/schema/sources.ts` - Defines the sources table
- `src/db/schema/sourceChunks.ts` - Defines the sourceChunks and sourceEmbeddings tables
- `src/db/schema/suggestedQuestions.ts` - Defines the suggestedQuestions table
- `src/db/schema/users.ts` - Defines the users table

Each schema file exports TypeScript types for the table's row data and insert operations, making it easy to work with the database in a type-safe manner.
