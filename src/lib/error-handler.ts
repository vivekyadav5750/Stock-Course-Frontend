/**
 * Extracts the most useful error message from API error responses
 */
export const getErrorMessage = (error: any, fallback: string = 'An error occurred'): string => {
  // If error is a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // Extract from axios error response
  const response = error?.response?.data;
  
  if (!response) {
    return error?.message || fallback;
  }

  // If there's a detailed errors array, prioritize that
  if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
    // If single error, return its message
    if (response.errors.length === 1) {
      return response.errors[0].message;
    }
    
    // If multiple errors, combine them
    return response.errors.map((err: any) => err.message).join(', ');
  }

  // Fall back to general message
  return response.message || fallback;
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
