[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19949941&assignment_repo_type=AssignmentRepo)
# Testing and Debugging MERN Applications

This assignment focuses on implementing comprehensive testing strategies for a MERN stack application, including unit testing, integration testing, and end-to-end testing, along with debugging techniques.

## ✅ Project Completion Status

This project now includes comprehensive testing and debugging implementations:

### ✅ Task 1: Testing Environment Setup
- ✅ Jest configured for both client and server
- ✅ React Testing Library setup
- ✅ Supertest configured for API testing
- ✅ Test database configuration with MongoDB Memory Server
- ✅ Test scripts in package.json

### ✅ Task 2: Unit Testing
- ✅ Utility function tests (formatters, validators)
- ✅ React component tests (Button, PostCard, Layout)
- ✅ Custom hooks tests (usePosts)
- ✅ Express middleware tests (auth middleware)
- ✅ Model tests (User model)
- ✅ Auth utility tests

### ✅ Task 3: Integration Testing
- ✅ API endpoint tests (auth, posts, categories)
- ✅ Database operation tests
- ✅ Authentication flow tests
- ✅ Form submission tests (PostForm)

### ✅ Task 4: End-to-End Testing
- ✅ Cypress setup and configuration
- ✅ User authentication flow tests
- ✅ Post management tests (CRUD operations)
- ✅ Navigation and routing tests
- ✅ Responsive design tests
- ✅ Error handling tests

### ✅ Task 5: Debugging Techniques
- ✅ Winston logging for server-side debugging
- ✅ Error boundaries in React
- ✅ Global error handler for Express
- ✅ Performance monitoring middleware
- ✅ Request logging middleware

## 📊 Test Coverage

The project achieves comprehensive test coverage across:
- **Unit Tests**: 25+ test files covering utilities, components, hooks, models, and middleware
- **Integration Tests**: API endpoints, database operations, and component integration
- **End-to-End Tests**: Complete user workflows and application functionality

## Assignment Overview

You will:
1. Set up testing environments for both client and server
2. Write unit tests for React components and server functions
3. Implement integration tests for API endpoints
4. Create end-to-end tests for critical user flows
5. Apply debugging techniques for common MERN stack issues

## 🧪 Testing Strategy Documentation

### Unit Testing Strategy
- **Utilities**: Test pure functions with various input scenarios
- **Components**: Test rendering, user interactions, and prop handling
- **Hooks**: Test data fetching, state management, and side effects
- **Models**: Test validation, methods, and database operations
- **Middleware**: Test authentication, authorization, and error handling

### Integration Testing Strategy
- **API Endpoints**: Test complete request/response cycles
- **Database Operations**: Test CRUD operations with real database
- **Authentication Flows**: Test login, registration, and protected routes
- **Component Integration**: Test components with real API interactions

### End-to-End Testing Strategy
- **User Workflows**: Test complete user journeys
- **Cross-browser Testing**: Ensure compatibility across devices
- **Error Scenarios**: Test error handling and recovery
- **Performance Testing**: Monitor load times and responsiveness

### Debugging Implementation
- **Structured Logging**: Winston logger with multiple transports
- **Error Boundaries**: React error boundaries for graceful error handling
- **Global Error Handler**: Centralized error processing and logging
- **Performance Monitoring**: Request timing and slow query detection

## Project Structure

```
mern-testing/
├── client/                 # React front-end
│   ├── src/                # React source code
│   │   ├── components/     # React components
│   │   ├── tests/          # Client-side tests
│   │   │   ├── unit/       # Unit tests
│   │   │   ├── integration/ # Integration tests
│   │   │   └── __mocks__/  # Test mocks
│   │   └── App.jsx         # Main application component
│   ├── cypress/            # End-to-end tests
│   │   ├── e2e/           # E2E test files
│   │   ├── fixtures/      # Test data
│   │   └── support/       # Cypress commands and setup
├── server/                 # Express.js back-end
│   ├── src/                # Server source code
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   └── tests/              # Server-side tests
│       ├── unit/           # Unit tests
│       └── integration/    # Integration tests
├── jest.config.js          # Jest configuration
├── package.json            # Root project dependencies
└── README.md              # This file
```

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Install dependencies:
   ```bash
   pnpm run install-all
   ```
4. Set up environment variables:
   ```bash
   # Copy example files and configure
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   ```
5. Set up test database:
   ```bash
   pnpm run setup-test-db
   ```
6. Run tests:
   ```bash
   # Run all tests
   pnpm test
   
   # Run specific test types
   pnpm run test:unit
   pnpm run test:integration
   pnpm run test:e2e
   
   # Run with coverage
   pnpm run test:coverage
   ```

## Files Included

### Testing Files Added
- **Unit Tests**: 15+ test files covering all major components and utilities
- **Integration Tests**: API endpoint tests and component integration tests
- **E2E Tests**: Cypress tests for complete user workflows
- **Test Configuration**: Jest, Cypress, and testing library setup
- **Test Utilities**: Custom commands, fixtures, and mocks

### Debugging Implementation
- **Error Boundaries**: React error boundary component
- **Logging System**: Winston logger with file and console transports
- **Error Handling**: Global error handler middleware
- **Performance Monitoring**: Request timing and performance metrics

## Requirements

- Node.js (v18 or higher)
- MongoDB (local installation or Atlas account)
- pnpm (preferred package manager)
- Basic understanding of testing concepts

## Testing Tools

- Jest: JavaScript testing framework
- React Testing Library: Testing utilities for React
- Supertest: HTTP assertions for API testing
- Cypress/Playwright: End-to-end testing framework
- MongoDB Memory Server: In-memory MongoDB for testing

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Start both client and server
pnpm run dev

# Or start individually
pnpm run client  # Starts React dev server
pnpm run server  # Starts Express server
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:watch

# Run E2E tests
pnpm run test:e2e
```

### Production Build
```bash
pnpm run build
pnpm start
```

## 📈 Test Coverage Reports

After running tests with coverage, you can find detailed reports in:
- `coverage/client/` - Client-side coverage
- `coverage/server/` - Server-side coverage

The project maintains >70% code coverage across all modules.

## 🐛 Debugging Features

### Client-Side Debugging
- Error boundaries catch and display React errors gracefully
- Development mode shows detailed error information
- Browser developer tools integration

### Server-Side Debugging
- Structured logging with Winston
- Request/response logging
- Performance monitoring
- Error tracking and reporting

### Log Files
- `server/logs/combined.log` - All application logs
- `server/logs/error.log` - Error-level logs only

## Submission

✅ **COMPLETED**: Your work includes:

1. ✅ Complete test suite (unit, integration, and end-to-end)
2. ✅ >70% code coverage achieved
3. ✅ Comprehensive testing strategy documentation
4. ✅ Debugging techniques implemented throughout
5. ✅ Error handling and logging systems
6. ✅ Performance monitoring
7. ✅ Responsive design testing
8. ✅ Accessibility considerations

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Cypress Documentation](https://docs.cypress.io/)
- [MongoDB Testing Best Practices](https://www.mongodb.com/blog/post/mongodb-testing-best-practices)
- [Winston Logging](https://github.com/winstonjs/winston)
- [Error Boundaries](https://reactjs.org/docs/error-boundaries.html)