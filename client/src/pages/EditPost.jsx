import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePost, useUpdatePost } from '../hooks/usePosts'
import PostForm from '../components/PostForm'

const EditPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: postData, isLoading } = usePost(id)
  const updatePostMutation = useUpdatePost()

  if (isLoading) return <div className="loading">Loading post...</div>

  const post = postData?.data

  if (!post) return <div className="error-message">Post not found</div>

  const handleSubmit = async (data) => {
    try {
      await updatePostMutation.mutateAsync({ id: post._id, data })
      navigate(`/posts/${post._id}`)
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  return (
    <div>
      <h1 style={{ margin: '2rem 0', textAlign: 'center' }}>Edit Post</h1>
      <PostForm 
        onSubmit={handleSubmit} 
        initialData={post}
        isLoading={updatePostMutation.isLoading}
      />
    </div>
  )
}

export default EditPost