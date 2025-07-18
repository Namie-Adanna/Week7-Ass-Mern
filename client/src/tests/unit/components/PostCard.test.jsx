// Unit tests for PostCard component
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import PostCard from '../../../components/PostCard';

// Mock data
const mockPost = {
  _id: '123',
  title: 'Test Post Title',
  excerpt: 'This is a test excerpt for the post',
  createdAt: '2023-12-25T12:00:00Z',
  author: {
    name: 'John Doe',
  },
  category: {
    name: 'Technology',
  },
  featuredImage: true,
};

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PostCard Component', () => {
  it('should render post information correctly', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test excerpt for the post')).toBeInTheDocument();
    expect(screen.getByText(/By John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Technology/)).toBeInTheDocument();
  });

  it('should render link to post detail page', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    
    const titleLink = screen.getByRole('link', { name: 'Test Post Title' });
    expect(titleLink).toHaveAttribute('href', '/posts/123');
  });

  it('should render featured image when present', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    
    const image = screen.getByRole('img', { name: 'Test Post Title' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('pexels'));
  });

  it('should not render image when featuredImage is false', () => {
    const postWithoutImage = { ...mockPost, featuredImage: false };
    renderWithRouter(<PostCard post={postWithoutImage} />);
    
    const image = screen.queryByRole('img');
    expect(image).not.toBeInTheDocument();
  });

  it('should format date correctly', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    
    expect(screen.getByText(/December 25, 2023/)).toBeInTheDocument();
  });

  it('should handle missing excerpt gracefully', () => {
    const postWithoutExcerpt = { ...mockPost, excerpt: null };
    renderWithRouter(<PostCard post={postWithoutExcerpt} />);
    
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.queryByText('This is a test excerpt')).not.toBeInTheDocument();
  });

  it('should handle missing author name gracefully', () => {
    const postWithoutAuthor = { ...mockPost, author: null };
    renderWithRouter(<PostCard post={postWithoutAuthor} />);
    
    expect(screen.getByText(/By •/)).toBeInTheDocument();
  });

  it('should handle missing category gracefully', () => {
    const postWithoutCategory = { ...mockPost, category: null };
    renderWithRouter(<PostCard post={postWithoutCategory} />);
    
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    // Should still render other meta information
    expect(screen.getByText(/By John Doe/)).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    
    const postCard = screen.getByText('Test Post Title').closest('.post-card');
    expect(postCard).toHaveClass('post-card');
    
    const postContent = screen.getByText('Test Post Title').closest('.post-card-content');
    expect(postContent).toHaveClass('post-card-content');
  });
});