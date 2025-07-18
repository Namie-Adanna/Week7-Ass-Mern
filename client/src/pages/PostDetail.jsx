import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePost, useDeletePost } from '../hooks/usePosts'
import { useAuth } from '../context/AuthContext'
import { postService } from '../services/api'

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: postData, isLoading, error } = usePost(id)
  const deletePostMutation = useDeletePost()
  const [comment, setComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  if (isLoading) return <div className="loading">Loading post...</div>
  if (error) return <div className="error-message">Error loading post</div>

  const post = postData?.data

  if (!post) return <div className="error-message">Post not found</div>

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePostMutation.mutateAsync(post._id)
        navigate('/')
      } catch (error) {
        console.error('Error deleting post:', error)
      }
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    setIsSubmittingComment(true)
    try {
      await postService.addComment(post._id, { content: comment })
      setComment('')
      // Refresh the page to show new comment
      window.location.reload()
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const canEditPost = user && (user.id === post.author._id || user.role === 'admin')

  return (
    <div className="post-detail">
      <img
        src="https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=800"
        alt={post.title}
      />
      <div className="post-detail-content">
        <h1>{post.title}</h1>
        <div className="post-meta">
          By {post.author.name} • {formatDate(post.createdAt)} • {post.category.name} • {post.viewCount} views
        </div>
        
        {canEditPost && (
          <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem' }}>
            <Link to={`/edit-post/${post._id}`} className="btn btn-secondary">
              Edit Post
            </Link>
            <button 
              onClick={handleDelete} 
              className="btn btn-danger"
              disabled={deletePostMutation.isLoading}
            >
              {deletePostMutation.isLoading ? 'Deleting...' : 'Delete Post'}
            </button>
          </div>
        )}

        <div className="post-content">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} style={{ marginBottom: '1rem' }}>
              {paragraph}
            </p>
          ))}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div style={{ margin: '2rem 0' }}>
            <strong>Tags: </strong>
            {post.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  background: '#e2e8f0',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  marginRight: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <div className="comments">
          <h3>Comments ({post.comments?.length || 0})</h3>
          
          {user && (
            <form onSubmit={handleCommentSubmit} style={{ margin: '1rem 0' }}>
              <div className="form-group">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="3"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmittingComment}
              >
                {isSubmittingComment ? 'Adding...' : 'Add Comment'}
              </button>
            </form>
          )}

          {post.comments?.map((comment) => (
            <div key={comment._id} className="comment">
              <div className="comment-author">
                {comment.user?.name} • {formatDate(comment.createdAt)}
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PostDetail