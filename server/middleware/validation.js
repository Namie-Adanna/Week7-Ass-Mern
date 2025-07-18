// validation.js - Input validation middleware

const Joi = require('joi');

// Validate post data
const validatePost = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().max(100).trim(),
    content: Joi.string().required(),
    excerpt: Joi.string().max(200),
    category: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    isPublished: Joi.boolean(),
    featuredImage: Joi.string(),
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};

// Validate category data
const validateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().max(50).trim(),
    description: Joi.string().max(200),
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};

// Validate user registration
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().max(50).trim(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};

// Validate user login
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};

module.exports = {
  validatePost,
  validateCategory,
  validateRegister,
  validateLogin,
};