// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 8 chars, at least one letter and one number)
export const isValidPassword = (password) => {
  return password.length >= 8;
};

// Check if value is empty
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Validate required fields
export const validateRequired = (fields) => {
  const errors = {};
  
  Object.keys(fields).forEach((key) => {
    if (isEmpty(fields[key])) {
      errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')} is required`;
    }
  });
  
  return errors;
};

// Validate registration form
export const validateRegistration = (data) => {
  const errors = {};
  
  if (isEmpty(data.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (isEmpty(data.password)) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  // if (data.password !== data.re_password) {
  //   errors.re_password = 'Passwords do not match';
  // }
  
  return errors;
};




// Validate login form
export const validateLogin = (data) => {
  const errors = {};
  
  if (isEmpty(data.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (isEmpty(data.password)) {
    errors.password = 'Password is required';
  }
  
  return errors;
};

// Validate job form
export const validateJob = (data) => {
  const errors = {};
  
  if (isEmpty(data.title)) {
    errors.title = 'Job title is required';
  }
  
  if (isEmpty(data.description)) {
    errors.description = 'Job description is required';
  }
  
  if (isEmpty(data.location)) {
    errors.location = 'Location is required';
  }
  
  return errors;
};

// Validate profile form
export const validateProfile = (data) => {
  const errors = {};
  
  if (data.phone && !/^[\d\s\-+()]+$/.test(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return errors;
};

// Check if there are any errors
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};
