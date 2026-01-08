/**
 * Validation functions for lesson data
 */

/**
 * Validate duration format (HH:MM:SS or MM:SS)
 */
function validateDuration(duration) {
  const pattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  const match = duration.match(pattern);

  if (!match) {
    return { valid: false, error: 'Invalid format. Use HH:MM:SS or MM:SS' };
  }

  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (minutes >= 60 || seconds >= 60) {
    return { valid: false, error: 'Invalid time values' };
  }

  return { valid: true, seconds: hours * 3600 + minutes * 60 + seconds };
}

/**
 * Validate Hijri date format
 */
function validateHijriDate(date) {
  // Accept formats: "13/7/1447" or "١٣/ ٧/ ١٤٤٧" or "13/ 7/ 1447"
  const pattern = /^[\u0660-\u0669\d]{1,2}\s*\/\s*[\u0660-\u0669\d]{1,2}\s*\/\s*[\u0660-\u0669\d]{4}$/;

  if (!pattern.test(date)) {
    return { valid: false, error: 'Invalid format. Use DD/MM/YYYY or ١٣/ ٧/ ١٤٤٧' };
  }

  return { valid: true };
}

/**
 * Validate URL format
 */
function validateURL(url) {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate lesson number (must be positive integer)
 */
function validateLessonNumber(num) {
  const parsed = parseInt(num);
  if (isNaN(parsed) || parsed < 1) {
    return { valid: false, error: 'Must be a positive number' };
  }
  return { valid: true, value: parsed };
}

/**
 * Validate hadith number
 */
function validateHadithNumber(num) {
  const parsed = parseInt(num);
  if (isNaN(parsed) || parsed < 1 || parsed > 10000) {
    return { valid: false, error: 'Must be between 1 and 10000' };
  }
  return { valid: true, value: parsed };
}

/**
 * Validate hadith range (start must be <= end)
 */
function validateHadithRange(start, end) {
  if (start > end) {
    return { valid: false, error: 'Start number must be less than or equal to end number' };
  }
  return { valid: true };
}

/**
 * Validate required field (not empty)
 */
function validateRequired(value, fieldName) {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

module.exports = {
  validateDuration,
  validateHijriDate,
  validateURL,
  validateLessonNumber,
  validateHadithNumber,
  validateHadithRange,
  validateRequired
};
