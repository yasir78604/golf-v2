const z = require('zod');

// Reusable UUID validator
const uuidSchema = z.string().uuid({ message: 'Invalid UUID format' });

// ============================================
// AUTH SCHEMAS
// ============================================

const signup = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  fullName: z.string().min(2, { message: 'Full name is required' }),
  charityId: uuidSchema,
  charityPercentage: z.number().int().min(10).max(100).default(10),
});

const login = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// ============================================
// SCORE SCHEMAS
// ============================================

const createScore = z.object({
  date: z.coerce.date({ errorMap: () => ({ message: 'Invalid date format' }) }),
  points: z.number().int().min(1).max(45, { message: 'Points must be between 1 and 45' }),
});

const updateScore = z.object({
  date: z.coerce.date().optional(),
  points: z.number().int().min(1).max(45).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field (date or points) is required for update',
});

// ============================================
// DRAW SCHEMAS (Admin)
// ============================================

const simulateDraw = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, { message: 'Month must be in YYYY-MM format' }),
  logic: z.enum(['random', 'weighted_popular', 'weighted_underdog']),
});

// ============================================
// CHARITY SCHEMAS (Admin)
// ============================================

const createCharity = z.object({
  name: z.string().min(1, { message: 'Charity name is required' }),
  description: z.string().default(''),
  imageUrl: z.string().url({ message: 'Invalid image URL' }).default(''),
  website: z.string().url({ message: 'Invalid website URL' }).default(''),
  isFeatured: z.boolean().default(false),
});

const updateCharity = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  isFeatured: z.boolean().optional(),
});

// ============================================
// EXPORT ALL
// ============================================

module.exports = {
  signup,
  login,
  createScore,
  updateScore,
  simulateDraw,
  createCharity,
  updateCharity,
};