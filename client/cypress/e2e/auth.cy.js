// E2E tests for authentication flows
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.logout(); // Ensure clean state
  });

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      cy.visit('/register');
      
      // Fill registration form
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[name="password"]').type('password123');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Should show user is logged in
      cy.contains('Welcome, John Doe').should('be.visible');
      cy.contains('Create Post').should('be.visible');
      cy.contains('Logout').should('be.visible');
    });

    it('should show validation errors for invalid data', () => {
      cy.visit('/register');
      
      // Try to submit without filling fields
      cy.get('button[type="submit"]').click();
      
      // Should show validation messages
      cy.get('input[name="name"]:invalid').should('exist');
      cy.get('input[name="email"]:invalid').should('exist');
      cy.get('input[name="password"]:invalid').should('exist');
    });

    it('should show error for existing email', () => {
      // First, register a user
      cy.register({ email: 'existing@example.com' });
      cy.logout();
      
      cy.visit('/register');
      
      // Try to register with same email
      cy.get('input[name="name"]').type('Another User');
      cy.get('input[name="email"]').type('existing@example.com');
      cy.get('input[name="password"]').type('password123');
      
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains('User already exists').should('be.visible');
    });

    it('should navigate to login page from register page', () => {
      cy.visit('/register');
      
      cy.contains('Login here').click();
      
      cy.url().should('include', '/login');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Create a test user
      cy.register({ 
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      cy.logout();
    });

    it('should login user with correct credentials', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      
      cy.get('button[type="submit"]').click();
      
      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Should show user is logged in
      cy.contains('Welcome, Test User').should('be.visible');
    });

    it('should show error for incorrect credentials', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains('Invalid credentials').should('be.visible');
      
      // Should stay on login page
      cy.url().should('include', '/login');
    });

    it('should navigate to register page from login page', () => {
      cy.visit('/login');
      
      cy.contains('Register here').click();
      
      cy.url().should('include', '/register');
    });
  });

  describe('User Logout', () => {
    beforeEach(() => {
      cy.register();
    });

    it('should logout user successfully', () => {
      cy.visit('/');
      
      // User should be logged in
      cy.contains('Welcome,').should('be.visible');
      
      // Click logout
      cy.contains('Logout').click();
      
      // Should show login/register links
      cy.contains('Login').should('be.visible');
      cy.contains('Register').should('be.visible');
      
      // Should not show user-specific content
      cy.contains('Welcome,').should('not.exist');
      cy.contains('Create Post').should('not.exist');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without auth', () => {
      cy.visit('/create-post');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should allow access to protected route when authenticated', () => {
      cy.register();
      
      cy.visit('/create-post');
      
      // Should stay on create post page
      cy.url().should('include', '/create-post');
      cy.contains('Create New Post').should('be.visible');
    });
  });

  describe('Navigation Authentication State', () => {
    it('should show correct navigation for unauthenticated user', () => {
      cy.visit('/');
      
      cy.get('nav').within(() => {
        cy.contains('Home').should('be.visible');
        cy.contains('Login').should('be.visible');
        cy.contains('Register').should('be.visible');
        cy.contains('Create Post').should('not.exist');
        cy.contains('Logout').should('not.exist');
      });
    });

    it('should show correct navigation for authenticated user', () => {
      cy.register({ name: 'Auth User' });
      cy.visit('/');
      
      cy.get('nav').within(() => {
        cy.contains('Home').should('be.visible');
        cy.contains('Create Post').should('be.visible');
        cy.contains('Welcome, Auth User').should('be.visible');
        cy.contains('Logout').should('be.visible');
        cy.contains('Login').should('not.exist');
        cy.contains('Register').should('not.exist');
      });
    });
  });

  describe('Session Persistence', () => {
    it('should maintain login state after page refresh', () => {
      cy.register({ name: 'Persistent User' });
      cy.visit('/');
      
      // Verify logged in
      cy.contains('Welcome, Persistent User').should('be.visible');
      
      // Refresh page
      cy.reload();
      
      // Should still be logged in
      cy.contains('Welcome, Persistent User').should('be.visible');
    });
  });
});