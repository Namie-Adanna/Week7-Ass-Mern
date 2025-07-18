// Integration tests for PostForm component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import '@testing-library/jest-dom';
import PostForm from '../../components/PostForm';

// Mock the categories hook
jest.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    data: {
      data: [
        { _id: '1', name: 'Technology' },
        { _id: '2', name: 'Lifestyle' },
        { _id: '3', name: 'Travel' },
      ],
    },
    isLoading: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('PostForm Integration Tests', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPostForm = (props = {}) => {
    return render(
      <PostForm onSubmit={mockOnSubmit} isLoading={false} {...props} />,
      { wrapper: createWrapper() }
    );
  };

  it('should render all form fields', () => {
    renderPostForm();
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/excerpt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/publish immediately/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save post/i })).toBeInTheDocument();
  });

  it('should populate category options', () => {
    renderPostForm();
    
    const categorySelect = screen.getByLabelText(/category/i);
    expect(categorySelect).toBeInTheDocument();
    
    expect(screen.getByRole('option', { name: 'Technology' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Lifestyle' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Travel' })).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    const user = userEvent.setup();
    renderPostForm();
    
    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'Test Post Title');
    await user.type(screen.getByLabelText(/excerpt/i), 'Test excerpt');
    await user.type(screen.getByLabelText(/content/i), 'Test post content');
    await user.selectOptions(screen.getByLabelText(/category/i), '1');
    await user.type(screen.getByLabelText(/tags/i), 'react, javascript, testing');
    await user.click(screen.getByLabelText(/publish immediately/i));
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /save post/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Post Title',
        excerpt: 'Test excerpt',
        content: 'Test post content',
        category: '1',
        tags: ['react', 'javascript', 'testing'],
        isPublished: true,
      });
    });
  });

  it('should show validation errors for required fields', async () => {
    const user = userEvent.setup();
    renderPostForm();
    
    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /save post/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/content is required/i)).toBeInTheDocument();
      expect(screen.getByText(/category is required/i)).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should populate form with initial data when editing', () => {
    const initialData = {
      title: 'Existing Post',
      content: 'Existing content',
      excerpt: 'Existing excerpt',
      category: { _id: '2' },
      tags: ['existing', 'tags'],
      isPublished: true,
    };
    
    renderPostForm({ initialData });
    
    expect(screen.getByDisplayValue('Existing Post')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing content')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing excerpt')).toBeInTheDocument();
    expect(screen.getByDisplayValue('existing, tags')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should handle tags input correctly', async () => {
    const user = userEvent.setup();
    renderPostForm();
    
    await user.type(screen.getByLabelText(/title/i), 'Test Post');
    await user.type(screen.getByLabelText(/content/i), 'Test content');
    await user.selectOptions(screen.getByLabelText(/category/i), '1');
    await user.type(screen.getByLabelText(/tags/i), 'tag1, tag2,tag3,  tag4  ');
    
    await user.click(screen.getByRole('button', { name: /save post/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3', 'tag4'],
        })
      );
    });
  });

  it('should disable submit button when loading', () => {
    renderPostForm({ isLoading: true });
    
    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/saving/i);
  });

  it('should handle empty tags gracefully', async () => {
    const user = userEvent.setup();
    renderPostForm();
    
    await user.type(screen.getByLabelText(/title/i), 'Test Post');
    await user.type(screen.getByLabelText(/content/i), 'Test content');
    await user.selectOptions(screen.getByLabelText(/category/i), '1');
    await user.type(screen.getByLabelText(/tags/i), '  ,  , ,  ');
    
    await user.click(screen.getByRole('button', { name: /save post/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: [],
        })
      );
    });
  });

  it('should maintain form state during user interaction', async () => {
    const user = userEvent.setup();
    renderPostForm();
    
    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);
    
    await user.type(titleInput, 'Dynamic Title');
    await user.type(contentTextarea, 'Dynamic content');
    
    expect(titleInput).toHaveValue('Dynamic Title');
    expect(contentTextarea).toHaveValue('Dynamic content');
  });
});