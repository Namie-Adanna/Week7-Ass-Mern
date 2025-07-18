// posts.js - Post routes

const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
  searchPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { validatePost } = require('../middleware/validation');

const router = express.Router();

router.get('/search', searchPosts);
router.route('/').get(getPosts).post(protect, validatePost, createPost);
router
  .route('/:id')
  .get(getPost)
  .put(protect, validatePost, updatePost)
  .delete(protect, deletePost);
router.post('/:id/comments', protect, addComment);

module.exports = router;