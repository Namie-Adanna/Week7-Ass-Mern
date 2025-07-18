// Unit tests for usePosts hook
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { usePosts, usePost, useCreatePost } from '../../../hooks/usePosts';
import { postService } from '../../../services/api';

// Mock the API service
jest.mock('../../../services/api', () => ({
  postService: {
    getAllPosts: jest.fn(),
    getPost: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('usePosts Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('usePosts', () => {
    it('should fetch posts successfully', async () => {
      const mockPosts = {
        data: [
          { _id: '1', title: 'Post 1', content: 'Content 1' },
          { _id: '2', title: 'Post 2', content: 'Content 2' },
        ],
        total: 2,
        page: 1,
        pages: 1,
      };

      postService.getAllPosts.mockResolvedValue(mockPosts);

      const { result } = renderHook(() => usePosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPosts);
      expect(postService.getAllPosts).toHaveBeenCalledWith(1, 10, null);
    });

    it('should handle pagination parameters', async () => {
      const mockPosts = { data: [], total: 0, page: 2, pages: 1 };
      postService.getAllPosts.mockResolvedValue(mockPosts);

      const { result } = renderHook(() => usePosts(2, 5, 'tech'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(postService.getAllPosts).toHaveBeenCalledWith(2, 5, 'tech');
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      postService.getAllPosts.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('usePost', () => {
    it('should fetch single post successfully', async () => {
      const mockPost = {
        data: { _id: '1', title: 'Test Post', content: 'Test Content' },
      };

      postService.getPost.mockResolvedValue(mockPost);

      const { result } = renderHook(() => usePost('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPost);
      expect(postService.getPost).toHaveBeenCalledWith('1');
    });

    it('should not fetch when id is not provided', () => {
      const { result } = renderHook(() => usePost(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(postService.getPost).not.toHaveBeenCalled();
    });
  });

  describe('useCreatePost', () => {
    it('should create post successfully', async () => {
      const mockNewPost = {
        data: { _id: '3', title: 'New Post', content: 'New Content' },
      };

      postService.createPost.mockResolvedValue(mockNewPost);

      const { result } = renderHook(() => useCreatePost(), {
        wrapper: createWrapper(),
      });

      const postData = { title: 'New Post', content: 'New Content' };
      
      await waitFor(async () => {
        const response = await result.current.mutateAsync(postData);
        expect(response).toEqual(mockNewPost);
      });

      expect(postService.createPost).toHaveBeenCalledWith(postData);
    });

    it('should handle creation errors', async () => {
      const mockError = new Error('Creation failed');
      postService.createPost.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreatePost(), {
        wrapper: createWrapper(),
      });

      const postData = { title: 'New Post', content: 'New Content' };

      try {
        await result.current.mutateAsync(postData);
      } catch (error) {
        expect(error).toEqual(mockError);
      }

      expect(postService.createPost).toHaveBeenCalledWith(postData);
    });
  });
});