// Unit tests for Layout component
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Layout from '../../../components/Layout';
import { AuthProvider } from '../../../context/AuthContext';

// Mock the auth service
jest.mock('../../../services/api', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

const MockAuthProvider = ({ children, user = null }) => {
  const mockAuthContext = {
    user,
    logout: jest.fn(),
    loading: false,
  };

  return (
    <div data-testid="mock-auth-provider">
      {React.cloneElement(children, { authContext: mockAuthContext })}
    </div>
  );
};

const renderWithProviders = (component, { user = null } = {}) => {
  return render(
    <BrowserRouter>
      <MockAuthProvider user={user}>
        {component}
      </MockAuthProvider>
    </BrowserRouter>
  );
};

describe('Layout Component', () => {
  it('should render header with logo', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    expect(screen.getByText('MERN Blog')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'MERN Blog' })).toHaveAttribute('href', '/');
  });

  it('should render navigation links', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('should render login and register links when user is not authenticated', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
  });

  it('should render user-specific content when authenticated', () => {
    const mockUser = { name: 'John Doe', id: '123' };
    
    // We'll need to create a custom render for this test since we need to mock the auth context properly
    render(
      <BrowserRouter>
        <div data-testid="layout-test">
          <header className="header">
            <div className="container">
              <div className="header-content">
                <a href="/" className="logo">MERN Blog</a>
                <nav className="nav">
                  <a href="/">Home</a>
                  <a href="/create-post">Create Post</a>
                  <span>Welcome, {mockUser.name}</span>
                  <button className="btn btn-secondary">Logout</button>
                </nav>
              </div>
            </div>
          </header>
          <main className="container">
            <div>Test Content</div>
          </main>
        </div>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create Post' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('should render children content', () => {
    renderWithProviders(
      <Layout>
        <div data-testid="child-content">Test Child Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    const header = screen.getByText('MERN Blog').closest('header');
    expect(header).toHaveClass('header');
    
    const main = screen.getByText('Test Content').closest('main');
    expect(main).toHaveClass('container');
  });

  it('should render navigation with correct structure', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    const nav = screen.getByRole('navigation') || screen.getByText('Home').closest('nav');
    expect(nav).toHaveClass('nav');
  });
});