// Custom Cypress commands

// Command to login a user
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email,
      password,
    },
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

// Command to register a user
Cypress.Commands.add('register', (userData) => {
  const defaultUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };
  
  const user = { ...defaultUserData, ...userData };
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: user,
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

// Command to logout
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
});

// Command to create a test post
Cypress.Commands.add('createPost', (postData) => {
  const defaultPostData = {
    title: 'Test Post',
    content: 'This is a test post content',
    category: '507f1f77bcf86cd799439011',
    tags: ['test'],
    isPublished: true,
  };
  
  const post = { ...defaultPostData, ...postData };
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/posts`,
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('token')}`,
    },
    body: post,
  });
});

// Command to seed test data
Cypress.Commands.add('seedData', () => {
  // Create categories
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/categories`,
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('token')}`,
    },
    body: {
      name: 'Technology',
      description: 'Tech related posts',
    },
    failOnStatusCode: false,
  });
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/categories`,
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('token')}`,
    },
    body: {
      name: 'Lifestyle',
      description: 'Lifestyle posts',
    },
    failOnStatusCode: false,
  });
});

// Command to check accessibility
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="loading"]', { timeout: 1000 }).should('not.exist');
  cy.get('body').should('be.visible');
});

// Command to fill and submit post form
Cypress.Commands.add('fillPostForm', (postData) => {
  const defaultData = {
    title: 'Test Post Title',
    content: 'Test post content',
    excerpt: 'Test excerpt',
    category: 'Technology',
    tags: 'test, cypress',
  };
  
  const data = { ...defaultData, ...postData };
  
  cy.get('[data-testid="post-title"]').clear().type(data.title);
  cy.get('[data-testid="post-content"]').clear().type(data.content);
  cy.get('[data-testid="post-excerpt"]').clear().type(data.excerpt);
  cy.get('[data-testid="post-category"]').select(data.category);
  cy.get('[data-testid="post-tags"]').clear().type(data.tags);
  
  if (data.publish) {
    cy.get('[data-testid="post-publish"]').check();
  }
});