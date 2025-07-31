import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // 기본 에러 상태 코드
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Firebase Auth 에러 처리
  if (error.code?.startsWith('auth/')) {
    statusCode = 401;
    message = getAuthErrorMessage(error.code);
  }

  // Joi 검증 에러 처리
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  // Firebase Firestore 에러 처리
  if (error.code?.includes('firestore')) {
    statusCode = 500;
    message = 'Database operation failed';
  }

  // 개발 환경에서는 상세 에러 정보 포함
  const errorResponse: any = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: error.stack,
      code: error.code,
      originalError: error.details,
    };
  }

  res.status(statusCode).json(errorResponse);
};

// Firebase Auth 에러 메시지 변환
function getAuthErrorMessage(code: string): string {
  const authErrors: Record<string, string> = {
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Invalid password',
    'auth/email-already-in-use': 'Email already in use',
    'auth/weak-password': 'Password is too weak',
    'auth/invalid-email': 'Invalid email format',
    'auth/user-disabled': 'User account is disabled',
    'auth/too-many-requests': 'Too many requests, please try again later',
    'auth/id-token-expired': 'Authentication token expired',
    'auth/id-token-revoked': 'Authentication token revoked',
    'auth/insufficient-permission': 'Insufficient permissions',
  };

  return authErrors[code] || 'Authentication error';
}

// 커스텀 에러 클래스들
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}