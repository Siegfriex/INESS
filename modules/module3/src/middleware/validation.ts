import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

export interface ValidationOptions {
  allowUnknown?: boolean;
  stripUnknown?: boolean;
  abortEarly?: boolean;
}

// 요청 본문 검증
export const validateBody = (schema: Joi.Schema, options?: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      allowUnknown: options?.allowUnknown || false,
      stripUnknown: options?.stripUnknown || true,
      abortEarly: options?.abortEarly || false,
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logger.warn('Request body validation failed', {
        url: req.url,
        method: req.method,
        errors: errorDetails,
        body: req.body,
      });

      return next(new ValidationError('Request body validation failed', errorDetails));
    }

    // 검증된 데이터로 요청 본문 교체
    req.body = value;
    next();
  };
};

// 쿼리 파라미터 검증
export const validateQuery = (schema: Joi.Schema, options?: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      allowUnknown: options?.allowUnknown || false,
      stripUnknown: options?.stripUnknown || true,
      abortEarly: options?.abortEarly || false,
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logger.warn('Query validation failed', {
        url: req.url,
        method: req.method,
        errors: errorDetails,
        query: req.query,
      });

      return next(new ValidationError('Query validation failed', errorDetails));
    }

    // 검증된 데이터로 쿼리 교체
    req.query = value;
    next();
  };
};

// URL 파라미터 검증
export const validateParams = (schema: Joi.Schema, options?: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      allowUnknown: options?.allowUnknown || false,
      stripUnknown: options?.stripUnknown || true,
      abortEarly: options?.abortEarly || false,
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logger.warn('Params validation failed', {
        url: req.url,
        method: req.method,
        errors: errorDetails,
        params: req.params,
      });

      return next(new ValidationError('URL params validation failed', errorDetails));
    }

    // 검증된 데이터로 파라미터 교체
    req.params = value;
    next();
  };
};

// 헤더 검증
export const validateHeaders = (schema: Joi.Schema, options?: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.headers, {
      allowUnknown: options?.allowUnknown || true,
      stripUnknown: options?.stripUnknown || false,
      abortEarly: options?.abortEarly || false,
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logger.warn('Headers validation failed', {
        url: req.url,
        method: req.method,
        errors: errorDetails,
      });

      return next(new ValidationError('Headers validation failed', errorDetails));
    }

    next();
  };
};

// 종합 검증 (body, query, params 동시)
export const validate = (schemas: {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
  headers?: Joi.Schema;
}, options?: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: any[] = [];

    // Body 검증
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, {
        allowUnknown: options?.allowUnknown || false,
        stripUnknown: options?.stripUnknown || true,
        abortEarly: false,
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          type: 'body',
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        })));
      } else {
        req.body = value;
      }
    }

    // Query 검증
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, {
        allowUnknown: options?.allowUnknown || false,
        stripUnknown: options?.stripUnknown || true,
        abortEarly: false,
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          type: 'query',
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        })));
      } else {
        req.query = value;
      }
    }

    // Params 검증
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, {
        allowUnknown: options?.allowUnknown || false,
        stripUnknown: options?.stripUnknown || true,
        abortEarly: false,
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          type: 'params',
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        })));
      } else {
        req.params = value;
      }
    }

    // Headers 검증
    if (schemas.headers) {
      const { error } = schemas.headers.validate(req.headers, {
        allowUnknown: true,
        stripUnknown: false,
        abortEarly: false,
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          type: 'headers',
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        })));
      }
    }

    if (errors.length > 0) {
      logger.warn('Multiple validation errors', {
        url: req.url,
        method: req.method,
        errors,
      });

      return next(new ValidationError('Request validation failed', errors));
    }

    next();
  };
};