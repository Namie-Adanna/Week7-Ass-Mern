// categories.js - Category routes

const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { validateCategory } = require('../middleware/validation');

const router = express.Router();

router
  .route('/')
  .get(getCategories)
  .post(protect, validateCategory, createCategory);

router
  .route('/:id')
  .get(getCategory)
  .put(protect, validateCategory, updateCategory)
  .delete(protect, deleteCategory);

module.exports = router;