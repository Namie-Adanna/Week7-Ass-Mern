// Integration tests for category endpoints
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../models/User');
const Category = require('../../models/Category');
const { generateToken } = require('../unit/utils/auth');

let mongoServer;
let adminToken;
let userToken;
let adminUser;
let regularUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test users
  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  });

  regularUser = await User.create({
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
  });

  adminToken = generateToken(adminUser._id);
  userToken = generateToken(regularUser._id);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Category.deleteMany({});
});

describe('Category Endpoints', () => {
  describe('GET /api/categories', () => {
    beforeEach(async () => {
      await Category.insertMany([
        { name: 'Technology', description: 'Tech related posts' },
        { name: 'Lifestyle', description: 'Lifestyle posts' },
        { name: 'Travel', description: 'Travel experiences' },
      ]);
    });

    it('should get all categories', async () => {
      const res = await request(app)
        .get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('slug');
    });

    it('should return categories sorted by name', async () => {
      const res = await request(app)
        .get('/api/categories');

      expect(res.status).toBe(200);
      const names = res.body.data.map(cat => cat.name);
      expect(names).toEqual(['Lifestyle', 'Technology', 'Travel']);
    });

    it('should return empty array when no categories exist', async () => {
      await Category.deleteMany({});

      const res = await request(app)
        .get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/categories/:id', () => {
    let categoryId;
    let categorySlug;

    beforeEach(async () => {
      const category = await Category.create({
        name: 'Technology',
        description: 'Tech related posts',
      });
      categoryId = category._id;
      categorySlug = category.slug;
    });

    it('should get category by ID', async () => {
      const res = await request(app)
        .get(`/api/categories/${categoryId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Technology');
      expect(res.body.data.description).toBe('Tech related posts');
    });

    it('should get category by slug', async () => {
      const res = await request(app)
        .get(`/api/categories/${categorySlug}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Technology');
    });

    it('should return 404 for non-existent category', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/categories/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Category not found');
    });
  });

  describe('POST /api/categories', () => {
    it('should create category as admin', async () => {
      const categoryData = {
        name: 'New Category',
        description: 'A new category description',
      };

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Category');
      expect(res.body.data.slug).toBe('new-category');
      expect(res.body.data.description).toBe('A new category description');
    });

    it('should not create category as regular user', async () => {
      const categoryData = {
        name: 'Unauthorized Category',
        description: 'Should not be created',
      };

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(categoryData);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should not create category without authentication', async () => {
      const categoryData = {
        name: 'Unauthenticated Category',
        description: 'Should not be created',
      };

      const res = await request(app)
        .post('/api/categories')
        .send(categoryData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Missing name field',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should not create duplicate category names', async () => {
      await Category.create({
        name: 'Existing Category',
        description: 'Already exists',
      });

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Existing Category',
          description: 'Duplicate name',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Category with this name already exists');
    });

    it('should generate slug automatically', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Web Development & Design',
          description: 'Web dev category',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('web-development-design');
    });
  });

  describe('PUT /api/categories/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const category = await Category.create({
        name: 'Original Category',
        description: 'Original description',
      });
      categoryId = category._id;
    });

    it('should update category as admin', async () => {
      const updateData = {
        name: 'Updated Category',
        description: 'Updated description',
      };

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Category');
      expect(res.body.data.description).toBe('Updated description');
      expect(res.body.data.slug).toBe('updated-category');
    });

    it('should not update category as regular user', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Update',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent category', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Category not found');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const category = await Category.create({
        name: 'Category to Delete',
        description: 'Will be deleted',
      });
      categoryId = category._id;
    });

    it('should delete category as admin', async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify category is deleted
      const deletedCategory = await Category.findById(categoryId);
      expect(deletedCategory).toBeNull();
    });

    it('should not delete category as regular user', async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      // Verify category still exists
      const category = await Category.findById(categoryId);
      expect(category).toBeTruthy();
    });

    it('should return 404 for non-existent category', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Category not found');
    });
  });
});