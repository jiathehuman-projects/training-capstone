// /models/transformers.ts
export const decimalTransformer = {
  to: (value?: number | null) => (value ?? null),
  from: (value?: string | null) => (value !== null && value !== undefined ? Number(value) : null),
};