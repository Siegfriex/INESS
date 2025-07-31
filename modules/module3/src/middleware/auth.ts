import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { AuthenticationError, AuthorizationError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  roles?: string[];
  permissions?: string[];
  iss?: string;
  aud?: string;
  auth_time?: number;
  user_id?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  firebase?: {
    identities?: any;
    sign_in_provider?: string;
  };
}

// Request 인터페이스 확장
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      isAuthenticated?: boolean;
    }
  }
}

export class AuthMiddleware {
  // Firebase ID 토큰 검증
  static authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing or invalid authorization header');
      }

      const token = authHeader.split(' ')[1];
      
      if (!token) {
        throw new AuthenticationError('Missing token');
      }

      // Firebase ID 토큰 검증
      const decodedToken = await admin.auth().verifyIdToken(token, true);
      
      // 사용자 정보 요청 객체에 추가
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        iss: decodedToken.iss,
        aud: decodedToken.aud,
        auth_time: decodedToken.auth_time,
        user_id: decodedToken.user_id,
        sub: decodedToken.sub,
        iat: decodedToken.iat,
        exp: decodedToken.exp,
        firebase: decodedToken.firebase,
      };

      req.isAuthenticated = true;

      // 사용자 역할 및 권한 로드
      await AuthMiddleware.loadUserRoles(req);

      logger.request(req, `🔐 User authenticated: ${req.user.email}`, {
        uid: req.user.uid,
        email: req.user.email,
        roles: req.user.roles,
      });

      next();
    } catch (error: any) {
      logger.security('Authentication failed', req, {
        error: error.message,
        token: req.headers.authorization ? 'present' : 'missing',
      });

      next(new AuthenticationError(error.message));
    }
  };

  // 선택적 인증 (토큰이 있으면 검증, 없어도 통과)
  static optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.isAuthenticated = false;
      return next();
    }

    try {
      await AuthMiddleware.authenticateToken(req, res, next);
    } catch (error) {
      req.isAuthenticated = false;
      next();
    }
  };

  // 역할 기반 접근 제어
  static requireRole = (allowedRoles: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user || !req.isAuthenticated) {
        return next(new AuthenticationError());
      }

      const userRoles = req.user.roles || [];
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      const hasRequiredRole = roles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        logger.security('Access denied - insufficient role', req, {
          requiredRoles: roles,
          userRoles,
          uid: req.user.uid,
        });

        return next(new AuthorizationError(`Required role: ${roles.join(' or ')}`));
      }

      logger.request(req, `✅ Role authorization passed`, {
        requiredRoles: roles,
        userRoles,
      });

      next();
    };
  };

  // 권한 기반 접근 제어
  static requirePermission = (requiredPermissions: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user || !req.isAuthenticated) {
        return next(new AuthenticationError());
      }

      const userPermissions = req.user.permissions || [];
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      const hasRequiredPermission = permissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasRequiredPermission) {
        logger.security('Access denied - insufficient permission', req, {
          requiredPermissions: permissions,
          userPermissions,
          uid: req.user.uid,
        });

        return next(new AuthorizationError(`Required permission: ${permissions.join(' or ')}`));
      }

      logger.request(req, `✅ Permission authorization passed`, {
        requiredPermissions: permissions,
        userPermissions,
      });

      next();
    };
  };

  // 본인만 접근 가능 (리소스 소유자 확인)
  static requireOwnership = (getUserIdFromParams: (req: Request) => string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user || !req.isAuthenticated) {
        return next(new AuthenticationError());
      }

      const targetUserId = getUserIdFromParams(req);
      const currentUserId = req.user.uid;

      // 관리자는 모든 리소스에 접근 가능
      const isAdmin = req.user.roles?.includes('admin') || 
                     req.user.roles?.includes('super_admin');

      if (currentUserId !== targetUserId && !isAdmin) {
        logger.security('Access denied - ownership required', req, {
          currentUserId,
          targetUserId,
          isAdmin,
        });

        return next(new AuthorizationError('Access denied: resource ownership required'));
      }

      next();
    };
  };

  // 이메일 인증 필수
  static requireEmailVerified = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.isAuthenticated) {
      return next(new AuthenticationError());
    }

    if (!req.user.email_verified) {
      logger.security('Access denied - email not verified', req, {
        uid: req.user.uid,
        email: req.user.email,
      });

      return next(new AuthorizationError('Email verification required'));
    }

    next();
  };

  // 사용자 역할 및 권한 로드
  private static async loadUserRoles(req: Request): Promise<void> {
    if (!req.user) return;

    try {
      // Firestore에서 사용자 역할 및 권한 조회
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(req.user.uid)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        req.user.roles = userData?.roles || ['user'];
        req.user.permissions = userData?.permissions || [];
      } else {
        // 기본 역할 설정
        req.user.roles = ['user'];
        req.user.permissions = [];
      }
    } catch (error) {
      logger.error('Failed to load user roles', {
        uid: req.user.uid,
        error: (error as Error).message,
      });
      
      // 기본 역할 설정
      req.user.roles = ['user'];
      req.user.permissions = [];
    }
  }
}

// 편의 함수들
export const authenticateToken = AuthMiddleware.authenticateToken;
export const optionalAuth = AuthMiddleware.optionalAuth;
export const requireRole = AuthMiddleware.requireRole;
export const requirePermission = AuthMiddleware.requirePermission;
export const requireOwnership = AuthMiddleware.requireOwnership;
export const requireEmailVerified = AuthMiddleware.requireEmailVerified;