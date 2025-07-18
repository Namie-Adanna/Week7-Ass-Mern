import { useQuery, useMutation, useQueryClient } from 'react-query'
import { postService } from '../services/api'

// Hook to fetch all posts
export const usePosts = (page = 1, limit = 10, category = null) => {
  return useQuery(
    ['posts', page, limit, category],
    () => postService.getAllPosts(page, limit, category),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )
}

// Hook to fetch a single post
export const usePost = (id) => {
  return useQuery(
    ['post', id],
    () => postService.getPost(id),
    {
      enabled: !!id,
    }
  )
}

// Hook to create a new post
export const useCreatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(postService.createPost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts')
    },
  })
}

// Hook to update a post
export const useUpdatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, data }) => postService.updatePost(id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('posts')
        queryClient.setQueryData(['post', data.data._id], data)
      },
    }
  )
}

// Hook to delete a post
export const useDeletePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(postService.deletePost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts')
    },
  })
}

// Hook to search posts
export const useSearchPosts = (query) => {
  return useQuery(
    ['searchPosts', query],
    () => postService.searchPosts(query),
    {
      enabled: !!query && query.length > 2,
    }
  )
}