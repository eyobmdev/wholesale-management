import { showToast } from './toast.js';

/**
 * Handles standardized backend error responses.
 * @param {Error} err - The error caught from a request
 * @param {Function} setErrors - State setter for form field errors
 * @param {string} defaultTitle - Default toast title
 */
export const handleBackendErrors = (err, setErrors, defaultTitle = 'Error') => {
  const data = err.response?.data;
  
  if (data && typeof data === 'object') {
    // Extract field-level errors
    const errorsObject = data.errors || data; // Fallback to raw data if `errors` key doesn't exist
    const newErrors = {};

    Object.keys(errorsObject).forEach(key => {
      // Ignore top-level meta keys if fallback was used
      if (['success', 'status_code', 'message'].includes(key) && !data.errors) return;
      
      newErrors[key] = Array.isArray(errorsObject[key]) 
        ? errorsObject[key][0] 
        : errorsObject[key];
    });

    if (setErrors) {
      setErrors(newErrors);
    }

    // Show top-level message if provided, else use default message
    const message = data.message || (Object.keys(newErrors).length > 0 ? 'Please check the form for errors.' : 'An error occurred.');
    showToast.error(defaultTitle, message);
  } else {
    showToast.error(defaultTitle, err.message || 'An unexpected error occurred');
  }
};
