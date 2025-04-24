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

## Additional Security Measures

### HTTPS

All communication with the application is encrypted using HTTPS to protect data in transit.

### Content Security Policy

A strict Content Security Policy (CSP) is implemented to prevent XSS attacks and other code injection vulnerabilities.

### Rate Limiting

API endpoints are protected by rate limiting to prevent brute force attacks and abuse.

### Secure Headers

The application sets secure HTTP headers to protect against common web vulnerabilities:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Strict-Transport-Security: max-age=31536000; includeSubDomains
