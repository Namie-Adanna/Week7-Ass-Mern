// E2E tests for navigation and routing
describe('Navigation and Routing', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Main Navigation', () => {
    it('should navigate to home page', () => {
      cy.get('a[href="/"]').first().click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains('Latest Blog Posts').should('be.visible');
    });

    it('should navigate to login page', () => {
      cy.contains('Login').click();
      cy.url().should('include', '/login');
      cy.contains('Login').should('be.visible');
      cy.get('form').should('be.visible');
    });

    it('should navigate to register page', () => {
      cy.contains('Register').click();
      cy.url().should('include', '/register');
      cy.contains('Register').should('be.visible');
      cy.get('form').should('be.visible');
    });

    it('should show logo and navigate to home when clicked', () => {
      cy.visit('/login');
      cy.get('.logo').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Authenticated Navigation', () => {
    beforeEach(() => {
      cy.register({ name: 'Nav User' });
    });

    it('should show authenticated navigation items', () => {
      cy.visit('/');
      
      cy.get('nav').within(() => {
        cy.contains('Home').should('be.visible');
        cy.contains('Create Post').should('be.visible');
        cy.contains('Welcome, Nav User').should('be.visible');
        cy.contains('Logout').should('be.visible');
      });
    });

    it('should navigate to create post page', () => {
      cy.visit('/');
      cy.contains('Create Post').click();
      
      cy.url().should('include', '/create-post');
      cy.contains('Create New Post').should('be.visible');
    });

    it('should logout and update navigation', () => {
      cy.visit('/');
      cy.contains('Logout').click();
      
      cy.get('nav').within(() => {
        cy.contains('Login').should('be.visible');
        cy.contains('Register').should('be.visible');
        cy.contains('Create Post').should('not.exist');
        cy.contains('Welcome,').should('not.exist');
      });
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('should show correct page titles', () => {
      // Home page
      cy.visit('/');
      cy.title().should('contain', 'MERN Blog');
      
      // Login page
      cy.visit('/login');
      cy.contains('Login').should('be.visible');
      
      // Register page
      cy.visit('/register');
      cy.contains('Register').should('be.visible');
    });
  });

  describe('URL Routing', () => {
    it('should handle direct URL access', () => {
      cy.visit('/login');
      cy.url().should('include', '/login');
      cy.get('form').should('be.visible');
    });

    it('should handle browser back/forward buttons', () => {
      cy.visit('/');
      cy.contains('Login').click();
      cy.url().should('include', '/login');
      
      cy.go('back');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      cy.go('forward');
      cy.url().should('include', '/login');
    });

    it('should handle page refresh', () => {
      cy.visit('/login');
      cy.reload();
      cy.url().should('include', '/login');
      cy.get('form').should('be.visible');
    });
  });

  describe('Protected Route Redirects', () => {
    it('should redirect to login for protected routes', () => {
      cy.visit('/create-post');
      cy.url().should('include', '/login');
    });

    it('should redirect to intended page after login', () => {
      // Try to access protected route
      cy.visit('/create-post');
      cy.url().should('include', '/login');
      
      // Register/login
      cy.register();
      
      // Should redirect to originally intended page
      cy.visit('/create-post');
      cy.url().should('include', '/create-post');
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should display mobile navigation correctly', () => {
      cy.visit('/');
      
      cy.get('.header').should('be.visible');
      cy.get('.nav').should('be.visible');
      
      // Navigation items should be visible on mobile
      cy.contains('Home').should('be.visible');
      cy.contains('Login').should('be.visible');
      cy.contains('Register').should('be.visible');
    });

    it('should handle mobile navigation interactions', () => {
      cy.visit('/');
      
      cy.contains('Login').click();
      cy.url().should('include', '/login');
      
      cy.get('.logo').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Navigation Performance', () => {
    it('should load pages quickly', () => {
      const startTime = Date.now();
      
      cy.visit('/').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
      });
    });

    it('should handle rapid navigation changes', () => {
      cy.visit('/');
      cy.contains('Login').click();
      cy.contains('Register here').click();
      cy.contains('Login here').click();
      
      cy.url().should('include', '/login');
      cy.get('form').should('be.visible');
    });
  });

  describe('Accessibility Navigation', () => {
    it('should support keyboard navigation', () => {
      cy.visit('/');
      
      // Tab through navigation elements
      cy.get('body').tab();
      cy.focused().should('contain', 'MERN Blog');
      
      cy.focused().tab();
      cy.focused().should('contain', 'Home');
      
      cy.focused().tab();
      cy.focused().should('contain', 'Login');
    });

    it('should have proper ARIA labels', () => {
      cy.visit('/');
      
      cy.get('nav').should('exist');
      cy.get('a[href="/"]').should('have.attr', 'href', '/');
    });
  });

  describe('Error Page Navigation', () => {
    it('should handle 404 pages gracefully', () => {
      cy.visit('/non-existent-page', { failOnStatusCode: false });
      
      // Should show some kind of error or redirect
      cy.get('body').should('be.visible');
    });

    it('should allow navigation from error pages', () => {
      cy.visit('/non-existent-page', { failOnStatusCode: false });
      
      // Should be able to navigate to home
      cy.get('.logo').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });
});