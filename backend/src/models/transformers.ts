/**
 * Transform from string to number safely with enhanced validation
 */
export const decimalTransformer = {
  to: (value?: number | null) => {
    // Handle null/undefined values - convert to '0' for database default compatibility
    if (value === null || value === undefined) {
      return '0';
    }
    
    // Handle NaN values
    if (typeof value === 'number' && isNaN(value)) {
      return '0';
    }
    
    // Convert valid numbers to string with proper decimal places
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    
    // Fallback for any other type
    return '0';
  },
  from: (value?: string | null) => {
    // Handle null/undefined/empty string
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    
    // Parse the number
    const parsed = Number(value);
    
    // Return 0 for NaN values, otherwise return the parsed number
    return isNaN(parsed) ? 0 : parsed;
  },
};

/**
 * Transform JSON data to/from string for storage
 */
export const jsonTransformer = {
  to: (value: any): string | null => {
    return value ? JSON.stringify(value) : null;
  },
  from: (value: string | null): any => {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }
};