/**
 * Transform from string to number safely
 */
export const decimalTransformer = {
  to: (value?: number | null) => (value ?? null),
  from: (value?: string | null) => (value !== null && value !== undefined ? Number(value) : null),
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