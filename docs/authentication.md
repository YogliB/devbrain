# Authentication System

## Overview

DevBrain includes a complete authentication system with the following features:

- User registration with email and password
- User login with email and password
- Guest user mode with notifications
- Password strength validation
- Protected routes that require authentication
- Persistent sessions using localStorage

## User Authentication Flow

1. Users can register with an email and password
2. Passwords are securely hashed using bcrypt before storage
3. Upon successful login, a session is created and stored in localStorage
4. Protected routes check for valid authentication before allowing access
5. Users can log out, which clears the session

## Guest User Mode

Guest users can use the application without registering, but they are shown a notification that their data is not persisted between sessions. Guest users:

- Are assigned a temporary user ID
- Can create notebooks and use all features
- Will lose access to their data when their session expires
- Can convert to a registered user account if desired

## Implementation Details

The authentication system is implemented using React context and custom hooks:

- `AuthContext` provides authentication state to the entire application
- `useAuth` hook gives components access to authentication functions
- `withAuth` HOC protects routes that require authentication
- API routes validate authentication tokens before processing requests

## Security Considerations

- Passwords are never stored in plain text
- Authentication tokens have a limited lifespan
- CSRF protection is implemented for all authenticated requests
- Rate limiting is applied to login and registration endpoints
- Failed login attempts are logged and monitored
