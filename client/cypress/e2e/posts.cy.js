// E2E tests for post management
describe('Post Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.register({ 
      name: 'Post Author',
      email: 'author@example.com',
      role: 'admin'
    });
    cy.seedData();
  });

  describe('Post Listing', () => {
    it('should display posts on home page', () => {
      cy.visit('/');
      
      // Should show posts
      cy.get('.post-grid').should('be.visible');
      cy.get('.post-card').should('have.length.at.least', 1);
      
      // Each post card should have required elements
      cy.get('.post-card').first().within(() => {
        cy.get('h3 a').should('be.visible');
        cy.get('.post-meta').should('be.visible');
        cy.get('.post-excerpt').should('be.visible');
      });
    });

    it('should filter posts by category', () => {
      cy.visit('/');
      
      // Select a category filter
      cy.get('select').first().select('Technology');
      
      // Should show filtered posts
      cy.get('.post-card').should('exist');
      cy.get('.post-meta').should('contain', 'Technology');
    });

    it('should search posts', () => {
      cy.visit('/');
      
      // Type in search box
      cy.get('input[placeholder*="Search"]').type('React');
      
      // Should show search results
      cy.get('.post-card').should('exist');
      cy.contains('React').should('be.visible');
    });

    it('should navigate to post detail', () => {
      cy.visit('/');
      
      // Click on first post title
      cy.get('.post-card h3 a').first().click();
      
      // Should navigate to post detail page
      cy.url().should('include', '/posts/');
      cy.get('.post-detail').should('be.visible');
    });
  });

  describe('Post Creation', () => {
    it('should create a new post successfully', () => {
      cy.visit('/create-post');
      
      // Fill post form
      cy.get('input[id="title"]').type('My New Blog Post');
      cy.get('textarea[id="excerpt"]').type('This is an excerpt for my new post');
      cy.get('textarea[id="content"]').type('This is the full content of my new blog post. It contains detailed information about the topic.');
      cy.get('select[id="category"]').select('Technology');
      cy.get('input[id="tags"]').type('blog, test, cypress');
      cy.get('input[type="checkbox"]').check();
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to post detail page
      cy.url().should('include', '/posts/');
      cy.contains('My New Blog Post').should('be.visible');
      cy.contains('This is the full content').should('be.visible');
    });

    it('should show validation errors for empty required fields', () => {
      cy.visit('/create-post');
      
      // Try to submit without filling required fields
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.contains('Title is required').should('be.visible');
      cy.contains('Content is required').should('be.visible');
      cy.contains('Category is required').should('be.visible');
    });

    it('should handle form submission loading state', () => {
      cy.visit('/create-post');
      
      // Fill minimum required fields
      cy.get('input[id="title"]').type('Loading Test Post');
      cy.get('textarea[id="content"]').type('Test content');
      cy.get('select[id="category"]').select('Technology');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should show loading state
      cy.get('button[type="submit"]').should('contain', 'Saving...');
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  describe('Post Detail View', () => {
    beforeEach(() => {
      cy.createPost({
        title: 'Test Post for Detail View',
        content: 'This is test content for the detail view test.',
        excerpt: 'Test excerpt',
      });
    });

    it('should display post details correctly', () => {
      cy.visit('/');
      cy.contains('Test Post for Detail View').click();
      
      // Should show post details
      cy.get('.post-detail').within(() => {
        cy.contains('Test Post for Detail View').should('be.visible');
        cy.contains('This is test content').should('be.visible');
        cy.get('.post-meta').should('be.visible');
        cy.get('img').should('be.visible');
      });
    });

    it('should show edit and delete buttons for post author', () => {
      cy.visit('/');
      cy.contains('Test Post for Detail View').click();
      
      // Should show author controls
      cy.contains('Edit Post').should('be.visible');
      cy.contains('Delete Post').should('be.visible');
    });

    it('should allow adding comments when logged in', () => {
      cy.visit('/');
      cy.contains('Test Post for Detail View').click();
      
      // Should show comment form
      cy.get('textarea[placeholder*="Add a comment"]').should('be.visible');
      
      // Add a comment
      cy.get('textarea[placeholder*="Add a comment"]').type('This is a test comment');
      cy.contains('Add Comment').click();
      
      // Should show success or loading state
      cy.contains('Adding...').should('be.visible');
    });
  });

  describe('Post Editing', () => {
    beforeEach(() => {
      cy.createPost({
        title: 'Post to Edit',
        content: 'Original content',
        excerpt: 'Original excerpt',
      });
    });

    it('should edit post successfully', () => {
      cy.visit('/');
      cy.contains('Post to Edit').click();
      cy.contains('Edit Post').click();
      
      // Should navigate to edit page with pre-filled form
      cy.url().should('include', '/edit-post/');
      cy.get('input[id="title"]').should('have.value', 'Post to Edit');
      cy.get('textarea[id="content"]').should('have.value', 'Original content');
      
      // Edit the post
      cy.get('input[id="title"]').clear().type('Updated Post Title');
      cy.get('textarea[id="content"]').clear().type('Updated content for the post');
      
      // Submit changes
      cy.get('button[type="submit"]').click();
      
      // Should redirect back to post detail with updated content
      cy.url().should('include', '/posts/');
      cy.contains('Updated Post Title').should('be.visible');
      cy.contains('Updated content for the post').should('be.visible');
    });
  });

  describe('Post Deletion', () => {
    beforeEach(() => {
      cy.createPost({
        title: 'Post to Delete',
        content: 'This post will be deleted',
      });
    });

    it('should delete post with confirmation', () => {
      cy.visit('/');
      cy.contains('Post to Delete').click();
      
      // Click delete button
      cy.contains('Delete Post').click();
      
      // Should show confirmation dialog (browser confirm)
      // Note: Cypress automatically accepts confirm dialogs
      
      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Post should no longer exist
      cy.contains('Post to Delete').should('not.exist');
    });
  });

  describe('Post Pagination', () => {
    it('should navigate through pages', () => {
      cy.visit('/');
      
      // Check if pagination exists (only if there are multiple pages)
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Next")').length > 0) {
          // Click next page
          cy.contains('Next').click();
          
          // Should show page 2
          cy.contains('Page 2').should('be.visible');
          
          // Click previous page
          cy.contains('Previous').click();
          
          // Should show page 1
          cy.contains('Page 1').should('be.visible');
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/');
      
      // Should show mobile-friendly layout
      cy.get('.post-grid').should('be.visible');
      cy.get('.post-card').should('be.visible');
      
      // Navigation should be responsive
      cy.get('.header').should('be.visible');
      cy.get('.nav').should('be.visible');
    });

    it('should display correctly on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.visit('/');
      
      // Should show tablet layout
      cy.get('.post-grid').should('be.visible');
      cy.get('.post-card').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Intercept API calls to simulate network error
      cy.intercept('GET', '/api/posts*', { forceNetworkError: true }).as('getPostsError');
      
      cy.visit('/');
      
      // Should show error message
      cy.contains('Error loading posts').should('be.visible');
    });

    it('should handle 404 errors for non-existent posts', () => {
      cy.visit('/posts/non-existent-id', { failOnStatusCode: false });
      
      // Should show 404 or error message
      cy.contains('Post not found').should('be.visible');
    });
  });
});