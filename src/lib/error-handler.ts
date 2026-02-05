/**
 * Extracts the most useful error message from API error responses
 */
const normalizeMessage = (value: any, fallback: string): string => {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  if (Array.isArray(value)) {
    const messages = value
      .map((item) => (typeof item === 'string' ? item : item?.message))
      .filter(Boolean);
    return messages.length > 0 ? messages.join(', ') : fallback;
  }
  if (typeof value === 'object') {
    if (typeof value.message === 'string') return value.message;
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

export const getErrorMessage = (error: any, fallback: string = 'An error occurred'): string => {
  // If error is a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // Extract from axios error response
  const response = error?.response?.data;
  
  if (!response) {
    return normalizeMessage(error?.message ?? error, fallback);
  }

  // If there's a detailed errors array, prioritize that
  if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
    // If single error, return its message
    if (response.errors.length === 1) {
      return normalizeMessage(response.errors[0].message, fallback);
    }
    
    // If multiple errors, combine them
    return response.errors
      .map((err: any) => normalizeMessage(err?.message, fallback))
      .filter(Boolean)
      .join(', ') || fallback;
  }

  // Fall back to general message
  return normalizeMessage(response.message, fallback);
};

/**
 * Gets all error messages as an array (useful for displaying multiple errors)
 */
export const getAllErrorMessages = (error: any): string[] => {
  const response = error?.response?.data;
  
  if (!response) {
    return [error?.message || 'An error occurred'];
  }

  if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
    return response.errors.map((err: any) => err.message);
  }

  return [response.message || 'An error occurred'];
};

/**
 * Gets field-specific errors (useful for form validation)
 */
export const getFieldErrors = (error: any): Record<string, string> => {
  const response = error?.response?.data;
  
  if (!response?.errors || !Array.isArray(response.errors)) {
    return {};
  }

  const fieldErrors: Record<string, string> = {};
  
  response.errors.forEach((err: any) => {
    if (err.field) {
      // Extract the field name (e.g., "body.newPassword" -> "newPassword")
      const fieldName = err.field.split('.').pop() || err.field;
      fieldErrors[fieldName] = err.message;
    }
  });

  return fieldErrors;
};
