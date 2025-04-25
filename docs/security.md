# Security Features

## Input Sanitization

All user inputs are sanitized to prevent XSS (Cross-Site Scripting) attacks and SQL injection:

### HTML Sanitization

User-generated content that might contain HTML is sanitized using DOMPurify to remove potentially malicious tags and attributes. This applies to:

- Source content that may contain HTML markup
- Chat messages that might include formatted text
- Any other user-generated content that could contain HTML

### Text Sanitization

Plain text inputs are escaped to prevent HTML injection. This includes:

- Notebook titles
- Tags
- Search queries
- User profile information

### Database Sanitization

Inputs are sanitized before being stored in the database to prevent SQL injection attacks. This is handled by:

- Using parameterized queries via Drizzle ORM
- Validating input types and formats before database operations
- Escaping special characters in string inputs

### Filename Sanitization

Filenames are sanitized to remove unsafe characters and prevent path traversal attacks. This is important for:

- Source files uploaded by users
- Exported notebooks and data
- Any other user-provided filenames

## Row-Level Security

DevBrain implements data isolation using PostgreSQL's Row-Level Security (RLS) feature through Drizzle ORM. This ensures that each user can only access their own data, even if they share the same database.

For more details on the RLS implementation, see the [Database Documentation](./database.md#data-isolation-with-row-level-security).

## Additional Security Considerations

### Authentication Security

- Passwords are securely hashed using bcrypt before storage
- User authentication is verified on both client and server sides
- API routes validate user authentication through middleware
- Guest users have limited access and are clearly notified about data persistence limitations

### Service Worker Security

The application uses a service worker for WebLLM model management with security considerations:

- Service worker scope is limited to specific functionality
- Communication between the main thread and service worker is secured
- Service worker registration and activation follow security best practices

### Client-Side Data Processing

One of the key security features of DevBrain is that AI processing happens entirely on the client side:

- No user data is sent to external servers for AI processing
- Models run locally in the browser using WebLLM
- Source content and chat messages remain on the user's device

### Deployment Recommendations

When deploying to production, it's recommended to implement:

- HTTPS for all communications
- Content Security Policy (CSP) headers
- Rate limiting for authentication endpoints
- Additional secure headers (X-Content-Type-Options, X-Frame-Options, etc.)
