// Script to set up test database
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Post = require('../models/Post');

const setupTestDb = async () => {
  try {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/mern-blog-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to test database');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Post.deleteMany({});

    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin',
    });

    // Create test categories
    const categories = await Category.insertMany([
      { name: 'Technology', description: 'Tech related posts' },
      { name: 'Lifestyle', description: 'Lifestyle posts' },
      { name: 'Travel', description: 'Travel experiences' },
    ]);

    // Create test posts
    await Post.insertMany([
      {
        title: 'Getting Started with React',
        content: 'React is a popular JavaScript library for building user interfaces...',
        author: testUser._id,
        category: categories[0]._id,
        tags: ['react', 'javascript', 'frontend'],
        isPublished: true,
      },
      {
        title: 'Healthy Living Tips',
        content: 'Living a healthy lifestyle is important for overall well-being...',
        author: testUser._id,
        category: categories[1]._id,
        tags: ['health', 'lifestyle', 'wellness'],
        isPublished: true,
      },
    ]);

    console.log('Test database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
};

setupTestDb();