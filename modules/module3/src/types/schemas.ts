import Joi from 'joi';

// 공통 스키마 요소들
export const commonSchemas = {
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email address is required',
    'any.required': 'Email is required',
  }),
  
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required',
  }),

  firebaseUid: Joi.string().pattern(/^[a-zA-Z0-9]+$/).min(28).max(128).required().messages({
    'string.pattern.base': 'Invalid Firebase UID format',
    'string.min': 'Firebase UID too short',
    'string.max': 'Firebase UID too long',
    'any.required': 'User ID is required',
  }),

  mongoObjectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid ObjectId format',
  }),

  phoneNumber: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).messages({
    'string.pattern.base': 'Phone number must be in international format (+1234567890)',
  }),

  url: Joi.string().uri().messages({
    'string.uri': 'Must be a valid URL',
  }),
};

// 인증 관련 스키마
export const registerSchema = Joi.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  displayName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Display name must be at least 2 characters',
    'string.max': 'Display name cannot exceed 50 characters',
    'any.required': 'Display name is required',
  }),
  phoneNumber: commonSchemas.phoneNumber.optional(),
  acceptTerms: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must accept the terms and conditions',
    'any.required': 'Terms acceptance is required',
  }),
});

export const loginSchema = Joi.object({
  email: commonSchemas.email,
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
  rememberMe: Joi.boolean().optional().default(false),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: commonSchemas.password,
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Password confirmation does not match',
    'any.required': 'Password confirmation is required',
  }),
});

export const forgotPasswordSchema = Joi.object({
  email: commonSchemas.email,
});

// 사용자 관련 스키마
export const updateUserSchema = Joi.object({
  displayName: Joi.string().min(2).max(50).optional(),
  phoneNumber: commonSchemas.phoneNumber.optional(),
  bio: Joi.string().max(500).optional(),
  avatar: commonSchemas.url.optional(),
  preferences: Joi.object({
    language: Joi.string().valid('ko', 'en', 'ja').optional(),
    timezone: Joi.string().optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
});

export const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  search: Joi.string().max(100).optional(),
  role: Joi.string().valid('user', 'admin', 'moderator').optional(),
  status: Joi.string().valid('active', 'inactive', 'banned').optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'displayName', 'email').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional(),
});

// 관리자 관련 스키마
export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).optional(),
  permissions: Joi.array().items(Joi.string()).min(1).required(),
  priority: Joi.number().integer().min(0).max(100).optional().default(50),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(200).optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
  priority: Joi.number().integer().min(0).max(100).optional(),
});

export const createPermissionSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).optional(),
  category: Joi.string().valid('user', 'content', 'system', 'security').required(),
  resource: Joi.string().max(50).required(),
  action: Joi.string().valid('create', 'read', 'update', 'delete', 'manage').required(),
});

export const bulkUserActionSchema = Joi.object({
  action: Joi.string().valid('activate', 'deactivate', 'ban', 'unban', 'delete').required(),
  userIds: Joi.array().items(commonSchemas.firebaseUid).min(1).max(100).required(),
  reason: Joi.string().max(500).optional(),
});

// 시스템 설정 스키마
export const systemSettingsSchema = Joi.object({
  maintenance: Joi.object({
    enabled: Joi.boolean().optional(),
    message: Joi.string().max(500).optional(),
    allowedRoles: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  security: Joi.object({
    maxLoginAttempts: Joi.number().integer().min(1).max(20).optional(),
    lockoutDuration: Joi.number().integer().min(1).max(86400).optional(), // seconds
    sessionTimeout: Joi.number().integer().min(300).max(86400).optional(), // seconds
    requireEmailVerification: Joi.boolean().optional(),
    allowedDomains: Joi.array().items(Joi.string().hostname()).optional(),
  }).optional(),
  api: Joi.object({
    rateLimit: Joi.object({
      requests: Joi.number().integer().min(1).max(10000).optional(),
      windowMs: Joi.number().integer().min(1000).max(3600000).optional(), // milliseconds
    }).optional(),
    timeout: Joi.number().integer().min(1000).max(300000).optional(), // milliseconds
  }).optional(),
  features: Joi.object({
    userRegistration: Joi.boolean().optional(),
    socialLogin: Joi.boolean().optional(),
    fileUpload: Joi.boolean().optional(),
    notifications: Joi.boolean().optional(),
  }).optional(),
});

// 파일 업로드 스키마
export const fileUploadSchema = Joi.object({
  filename: Joi.string().max(255).required(),
  mimeType: Joi.string().pattern(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/).required(),
  size: Joi.number().integer().min(1).max(10485760).required(), // 10MB max
  category: Joi.string().valid('avatar', 'document', 'image', 'other').optional().default('other'),
});

// 로그 조회 스키마
export const getLogsQuerySchema = Joi.object({
  level: Joi.string().valid('error', 'warn', 'info', 'debug').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  service: Joi.string().max(50).optional(),
  limit: Joi.number().integer().min(1).max(1000).optional().default(100),
  search: Joi.string().max(200).optional(),
});

// API 사용량 조회 스키마
export const apiUsageQuerySchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  groupBy: Joi.string().valid('hour', 'day', 'week', 'month').optional().default('day'),
  endpoint: Joi.string().max(100).optional(),
  userId: commonSchemas.firebaseUid.optional(),
});

// 백업 생성 스키마
export const createBackupSchema = Joi.object({
  type: Joi.string().valid('full', 'incremental', 'users', 'settings').required(),
  description: Joi.string().max(200).optional(),
  includeFiles: Joi.boolean().optional().default(false),
  compression: Joi.string().valid('none', 'gzip', 'brotli').optional().default('gzip'),
});

// 파라미터 스키마들
export const userParamsSchema = Joi.object({
  userId: commonSchemas.firebaseUid,
});

export const roleParamsSchema = Joi.object({
  roleId: commonSchemas.mongoObjectId.required(),
});

export const backupParamsSchema = Joi.object({
  backupId: commonSchemas.mongoObjectId.required(),
});