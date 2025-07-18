import React, { useState } from 'react'
import { usePosts } from '../hooks/usePosts'
import { useCategories } from '../hooks/useCategories'
import PostCard from '../components/PostCard'

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: postsData, isLoading, error } = usePosts(currentPage, 10, selectedCategory)
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()

  if (isLoading) return <div className="loading">Loading posts...</div>
  if (error) return <div className="error-message">Error loading posts</div>

  const posts = postsData?.data || []
  const totalPages = postsData?.pages || 1

  return (
    <div>
      <h1 style={{ margin: '2rem 0', textAlign: 'center' }}>Latest Blog Posts</h1>
      
      {/* Filters */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {categoriesLoading && <p>Loading categories...</p>}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            setCurrentPage(1)
          }}
          style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
          disabled={categoriesLoading}
        >
          <option value="">All Categories</option>
          {categoriesData?.data?.map((category) => (
            <option key={category._id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            padding: '0.5rem', 
            borderRadius: '0.375rem', 
            border: '1px solid #d1d5db',
            flex: 1,
            maxWidth: '300px'
          }}
        />
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          No posts found.
        </div>
      ) : (
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          margin: '2rem 0' 
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span style={{ padding: '0.5rem 1rem' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Home