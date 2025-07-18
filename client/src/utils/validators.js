// Utility functions for form validation

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return !value || value.toString().length <= maxLength;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePostData = (data) => {
  const errors = {};
  
  if (!validateRequired(data.title)) {
    errors.title = 'Title is required';
  } else if (!validateMaxLength(data.title, 100)) {
    errors.title = 'Title must be less than 100 characters';
  }
  
  if (!validateRequired(data.content)) {
    errors.content = 'Content is required';
  }
  
  if (!validateRequired(data.category)) {
    errors.category = 'Category is required';
  }
  
  if (data.excerpt && !validateMaxLength(data.excerpt, 200)) {
    errors.excerpt = 'Excerpt must be less than 200 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateUserData = (data) => {
  const errors = {};
  
  if (!validateRequired(data.name)) {
    errors.name = 'Name is required';
  } else if (!validateMaxLength(data.name, 50)) {
    errors.name = 'Name must be less than 50 characters';
  }
  
  if (!validateRequired(data.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (!validateRequired(data.password)) {
    errors.password = 'Password is required';
  } else if (!validatePassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};