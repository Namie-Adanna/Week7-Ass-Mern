import React from 'react'
import { Link } from 'react-router-dom'

const PostCard = ({ post }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="post-card">
      {post.featuredImage && (
        <img
          src={`https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=400`}
          alt={post.title}
        />
      )}
      <div className="post-card-content">
        <h3>
          <Link to={`/posts/${post._id}`}>{post.title}</Link>
        </h3>
        <div className="post-meta">
          By {post.author?.name} • {formatDate(post.createdAt)} • {post.category?.name}
        </div>
        {post.excerpt && (
          <p className="post-excerpt">{post.excerpt}</p>
        )}
      </div>
    </div>
  )
}

export default PostCard