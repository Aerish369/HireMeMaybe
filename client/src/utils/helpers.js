// Format date to readable string
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format date to relative time
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  return formatDate(dateString);
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Format salary
export const formatSalary = (min, max, currency = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  if (min) {
    return `From ${formatter.format(min)}`;
  }
  if (max) {
    return `Up to ${formatter.format(max)}`;
  }
  return 'Salary not specified';
};

// Get job type label
export const getJobTypeLabel = (type) => {
  const types = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract',
    internship: 'Internship',
    freelance: 'Freelance',
    remote: 'Remote',
  };
  return types[type] || type;
};

// Get application status label and color
export const getApplicationStatus = (status) => {
  const statuses = {
    pending: { label: 'Pending', color: 'warning' },
    reviewed: { label: 'Reviewed', color: 'info' },
    shortlisted: { label: 'Shortlisted', color: 'primary' },
    rejected: { label: 'Rejected', color: 'destructive' },
    accepted: { label: 'Accepted', color: 'accent' },
  };
  return statuses[status] || { label: status, color: 'secondary' };
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Parse API errors
export const parseError = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Handle Django REST framework errors
    const messages = [];
    Object.keys(error).forEach((key) => {
      const value = error[key];
      if (Array.isArray(value)) {
        messages.push(...value);
      } else {
        messages.push(value);
      }
    });
    return messages.join('. ');
  }
  
  return 'An unexpected error occurred';
};


