# Vector Embeddings

DevBrain uses vector embeddings to enhance search and retrieval capabilities for source content. This document explains how the embedding system works and how it's implemented.

## Overview

When a user adds a source to a notebook, the content is automatically:

1. Chunked into smaller pieces
2. Converted to vector embeddings
3. Stored in the database for efficient retrieval

This process happens in the background and is transparent to the user.

## Implementation Details

### Text Chunking

Sources are split into smaller chunks to improve retrieval precision:

- Each chunk is approximately 1000 characters with 200 character overlap
- Chunking preserves paragraph boundaries where possible
- Metadata from the original source is preserved with each chunk

The chunking process is handled by the `chunking-utils.ts` module, which provides several chunking strategies:

- `chunkText`: Basic character-based chunking with overlap
- `chunkTextByTokens`: Token-based chunking (approximated)
- `recursiveChunking`: Handles very large documents by recursively chunking

### Embedding Generation

Chunks are converted to vector embeddings using:

- [@huggingface/transformers](https://github.com/huggingface/transformers.js) - The official Hugging Face Transformers.js library
- The default model is `all-MiniLM-L6-v2` (384 dimensions), which provides a good balance of quality and performance
- Embeddings are generated on the server during source creation/update

The embedding process is handled by the `embedding-utils.ts` module, which provides:

- `generateEmbedding`: Converts a text string to a vector embedding
- `generateEmbeddingsBatch`: Processes multiple texts in batches for efficiency
- `cosineSimilarity`: Utility for comparing embeddings

### Database Storage

Embeddings are stored in PostgreSQL using the pgvector extension:

- `source_chunks` table stores the text chunks
- `source_embeddings` table stores the vector embeddings
- Indexes are created for efficient similarity search

## Performance Considerations

The embedding system is designed with performance in mind:

- Chunking and embedding generation happen asynchronously after source creation
- Batch processing is used to reduce database load
- The embedding model is optimized for CPU usage
- Vector indexes use IVFFlat for efficient approximate nearest neighbor search

## Future Improvements

Potential future enhancements to the embedding system:

- Implement a worker queue for processing large sources
- Add support for different embedding models
- Improve chunking strategies based on semantic boundaries
- Add client-side caching of common queries
