import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useCategories } from '../hooks/useCategories'

const PostForm = ({ onSubmit, initialData, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const [tags, setTags] = useState('')

  useEffect(() => {
    if (initialData) {
      setValue('title', initialData.title)
      setValue('content', initialData.content)
      setValue('excerpt', initialData.excerpt)
      setValue('category', initialData.category?._id)
      setValue('isPublished', initialData.isPublished)
      setTags(initialData.tags?.join(', ') || '')
    }
  }, [initialData, setValue])

  const handleFormSubmit = (data) => {
    const formData = {
      ...data,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="form">
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && <div className="error">{errors.title.message}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="excerpt">Excerpt</label>
        <textarea
          id="excerpt"
          rows="3"
          {...register('excerpt')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          rows="10"
          {...register('content', { required: 'Content is required' })}
        />
        {errors.content && <div className="error">{errors.content.message}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        {categoriesLoading && <p>Loading categories...</p>}
        {categoriesError && <p className="error">Error loading categories: {categoriesError.message}</p>}
        <select
          id="category"
          {...register('category', { required: 'Category is required' })}
          disabled={categoriesLoading}
        >
          <option value="">Select a category</option>
          {categoriesData?.data?.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category && <div className="error">{errors.category.message}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="react, javascript, web development"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            {...register('isPublished')}
          />
          {' '}Publish immediately
        </label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Post'}
      </button>
    </form>
  )
}

export default PostForm