# GitHub Copilot Instructions for Astro-BSM Portal

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a React-based web application called **Astro-BSM Portal** for wound care business management. The application includes:

### Technology Stack
- **Frontend**: React 18, Vite, React Router, IndexedDB (Dexie), Lucide React icons
- **Backend**: Node.js, Express, PostgreSQL, CORS
- **Database**: PostgreSQL with JSON support for flexible data structures
- **Offline Support**: Service Worker, IndexedDB, background sync

### Key Features
- Customer order management with multi-step form
- Real-time notifications system
- Online/offline capabilities with data synchronization
- Responsive design for all devices
- Admin dashboard for order and customer management
- Progressive Web App (PWA) functionality

## Code Style Guidelines

### React Components
- Use functional components with hooks
- Implement proper error handling with try/catch blocks
- Use consistent naming conventions (PascalCase for components, camelCase for functions)
- Include proper PropTypes or TypeScript interfaces when applicable
- Implement loading states and error boundaries

### Database Operations
- Always use parameterized queries to prevent SQL injection
- Implement proper error handling for database operations
- Use transactions for multi-table operations
- Include proper indexing for performance optimization

### API Design
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement consistent error response format
- Include request validation and sanitization
- Use environment variables for configuration

## Specific Requirements

### Color Scheme
Always use the defined CSS custom properties:
- `--primary-green`: #2d5a27
- `--light-green`: #4a7c59
- `--accent-green`: #6db474
- `--golden-yellow`: #ffd700
- `--pure-white`: #ffffff
- `--error-red`: #dc3545

### Component Structure
- Keep components focused and single-purpose
- Use consistent styling with the established CSS classes
- Implement proper accessibility attributes
- Include responsive design considerations
- Use semantic HTML elements

### State Management
- Use React hooks (useState, useEffect, useContext) for state management
- Implement proper cleanup in useEffect hooks
- Handle loading and error states consistently
- Use IndexedDB for offline data storage
- Implement proper synchronization between online and offline data

### Error Handling
- Always include proper error handling in async operations
- Use toast notifications for user feedback
- Log errors appropriately for debugging
- Implement graceful degradation for offline scenarios

### Performance Considerations
- Implement lazy loading where appropriate
- Use proper React optimization techniques (memo, useMemo, useCallback)
- Optimize database queries with proper indexing
- Implement caching strategies for frequently accessed data

## Development Patterns

### File Organization
- Components in `src/components/`
- Pages in `src/pages/`
- Services in `src/services/`
- Utilities in `src/utils/`
- Server code in `server/`

### Service Layer
- Use consistent service patterns for API calls
- Implement proper retry logic for failed requests
- Handle offline scenarios gracefully
- Use consistent error handling across services

### Database Schema
- Use proper foreign key constraints
- Implement automatic timestamp updates
- Use JSON columns for flexible data structures
- Include proper indexing for performance

## Testing Guidelines

### Unit Testing
- Test individual components in isolation
- Test service functions with mocked dependencies
- Test utility functions with edge cases
- Test error scenarios and edge cases

### Integration Testing
- Test API endpoints with real database connections
- Test offline/online synchronization
- Test user workflows end-to-end
- Test responsive design across devices

## Security Considerations

### Input Validation
- Validate all user inputs on both client and server
- Sanitize data before database insertion
- Use parameterized queries for SQL operations
- Implement proper authentication and authorization

### Data Protection
- Use HTTPS for all communications
- Implement proper CORS configuration
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints

## Deployment Guidelines

### Environment Configuration
- Use environment variables for all configuration
- Implement proper staging and production environments
- Use secure secrets management for sensitive data
- Implement proper logging and monitoring

### CI/CD Pipeline
- Use GitHub Actions for automated deployment
- Implement proper testing in CI pipeline
- Use automated database migrations
- Implement proper rollback procedures

When generating code for this project, please ensure it follows these guidelines and maintains consistency with the existing codebase architecture and patterns.
