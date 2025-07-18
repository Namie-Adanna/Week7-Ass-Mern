import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePost } from '../hooks/usePosts'
import PostForm from '../components/PostForm'

const CreatePost = () => {
  const navigate = useNavigate()
  const createPostMutation = useCreatePost()

  const handleSubmit = async (data) => {
    try {
      const response = await createPostMutation.mutateAsync(data)
      navigate(`/posts/${response.data._id}`)
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  return (
    <div>
      <h1 style={{ margin: '2rem 0', textAlign: 'center' }}>Create New Post</h1>
      <PostForm 
        onSubmit={handleSubmit} 
        isLoading={createPostMutation.isLoading}
      />
    </div>
  )
}

export default CreatePost