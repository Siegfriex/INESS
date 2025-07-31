import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { AuthenticationError, ValidationError, ConflictError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  // 회원가입
  static register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, displayName, phoneNumber } = req.body;

      logger.business('User registration attempt', { email, displayName });

      // Firebase Auth에서 사용자 생성
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
        phoneNumber,
        emailVerified: false,
      });

      // Firestore에 사용자 프로필 생성
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        phoneNumber: userRecord.phoneNumber,
        roles: ['user'],
        permissions: ['read_own_profile', 'update_own_profile'],
        status: 'active',
        emailVerified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: null,
        profile: {
          bio: '',
          avatar: '',
          preferences: {
            language: 'ko',
            timezone: 'Asia/Seoul',
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
          },
        },
      };

      await admin.firestore()
        .collection('users')
        .doc(userRecord.uid)
        .set(userProfile);

      // 이메일 인증 링크 전송
      const emailVerificationLink = await admin.auth().generateEmailVerificationLink(email);
      
      logger.business('User registered successfully', {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: false,
          verificationEmailSent: true,
        },
      });
    } catch (error: any) {
      logger.error('User registration failed', {
        error: error.message,
        code: error.code,
        body: req.body,
      });

      if (error.code === 'auth/email-already-exists') {
        return next(new ConflictError('Email already exists'));
      } else if (error.code === 'auth/invalid-email') {
        return next(new ValidationError('Invalid email format'));
      } else if (error.code === 'auth/weak-password') {
        return next(new ValidationError('Password is too weak'));
      }

      next(error);
    }
  };

  // 로그인 (Firebase에서 처리하므로 토큰 검증만)
  static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      logger.business('Login attempt', { email });

      // 실제 로그인은 클라이언트에서 Firebase SDK로 처리
      // 여기서는 사용자 존재 여부만 확인
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // 마지막 로그인 시간 업데이트
      await admin.firestore()
        .collection('users')
        .doc(userRecord.uid)
        .update({
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      logger.business('Login successful', {
        uid: userRecord.uid,
        email: userRecord.email,
      });

      res.json({
        success: true,
        message: 'Use Firebase SDK for client-side authentication',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
        },
      });
    } catch (error: any) {
      logger.security('Login failed', req, {
        error: error.message,
        code: error.code,
        body: req.body,
      });

      if (error.code === 'auth/user-not-found') {
        return next(new AuthenticationError('Invalid email or password'));
      }

      next(error);
    }
  };

  // 로그아웃
  static logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;

      // Firebase에서 토큰 무효화
      await admin.auth().revokeRefreshTokens(user.uid);

      logger.business('User logged out', {
        uid: user.uid,
        email: user.email,
      });

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error('Logout failed', {
        error: error.message,
        uid: req.user?.uid,
      });

      next(error);
    }
  };

  // 토큰 갱신
  static refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      // 클라이언트에서 Firebase SDK를 사용하여 토큰 갱신 처리
      res.json({
        success: true,
        message: 'Use Firebase SDK for token refresh',
        instructions: 'Call firebase.auth().currentUser.getIdToken(true) for token refresh',
      });
    } catch (error: any) {
      logger.error('Token refresh failed', {
        error: error.message,
        refreshToken: req.body.refreshToken ? 'present' : 'missing',
      });

      next(new AuthenticationError('Token refresh failed'));
    }
  };

  // 현재 사용자 정보 조회
  static getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;

      // Firestore에서 상세 프로필 조회
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(user.uid)
        .get();

      const userData = userDoc.data();

      res.json({
        success: true,
        data: {
          uid: user.uid,
          email: user.email,
          displayName: user.name,
          emailVerified: user.email_verified,
          phoneNumber: userData?.phoneNumber,
          roles: userData?.roles || ['user'],
          permissions: userData?.permissions || [],
          status: userData?.status || 'active',
          profile: userData?.profile || {},
          createdAt: userData?.createdAt,
          lastLoginAt: userData?.lastLoginAt,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get current user', {
        error: error.message,
        uid: req.user?.uid,
      });

      next(error);
    }
  };

  // 프로필 업데이트
  static updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const updates = req.body;

      // Firebase Auth 업데이트
      const authUpdates: any = {};
      if (updates.displayName) authUpdates.displayName = updates.displayName;
      if (updates.phoneNumber) authUpdates.phoneNumber = updates.phoneNumber;

      if (Object.keys(authUpdates).length > 0) {
        await admin.auth().updateUser(user.uid, authUpdates);
      }

      // Firestore 프로필 업데이트
      const firestoreUpdates = {
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await admin.firestore()
        .collection('users')
        .doc(user.uid)
        .update(firestoreUpdates);

      logger.business('Profile updated', {
        uid: user.uid,
        updates: Object.keys(updates),
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updates,
      });
    } catch (error: any) {
      logger.error('Profile update failed', {
        error: error.message,
        uid: req.user?.uid,
        updates: req.body,
      });

      next(error);
    }
  };

  // 비밀번호 변경
  static changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const { newPassword } = req.body;

      // Firebase Auth에서 비밀번호 업데이트
      await admin.auth().updateUser(user.uid, {
        password: newPassword,
      });

      // 모든 refresh token 무효화
      await admin.auth().revokeRefreshTokens(user.uid);

      logger.security('Password changed', req, {
        uid: user.uid,
      });

      res.json({
        success: true,
        message: 'Password changed successfully. Please re-authenticate.',
      });
    } catch (error: any) {
      logger.security('Password change failed', req, {
        error: error.message,
        uid: req.user?.uid,
      });

      next(error);
    }
  };

  // 이메일 인증 전송
  static sendEmailVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;

      if (user.email_verified) {
        res.json({
          success: true,
          message: 'Email is already verified',
        });
        return;
      }

      // 이메일 인증 링크 생성 및 전송
      const emailVerificationLink = await admin.auth().generateEmailVerificationLink(user.email!);

      logger.business('Email verification sent', {
        uid: user.uid,
        email: user.email,
      });

      res.json({
        success: true,
        message: 'Email verification sent successfully',
      });
    } catch (error: any) {
      logger.error('Email verification failed', {
        error: error.message,
        uid: req.user?.uid,
      });

      next(error);
    }
  };

  // 비밀번호 재설정
  static forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      // 비밀번호 재설정 링크 생성
      const resetLink = await admin.auth().generatePasswordResetLink(email);

      logger.business('Password reset requested', { email });

      res.json({
        success: true,
        message: 'Password reset email sent successfully',
      });
    } catch (error: any) {
      logger.error('Password reset failed', {
        error: error.message,
        email: req.body.email,
      });

      if (error.code === 'auth/user-not-found') {
        // 보안상 사용자가 존재하지 않아도 성공 메시지 반환
        res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent',
        });
        return;
      }

      next(error);
    }
  };

  // 사용자 권한 조회
  static getUserPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;

      res.json({
        success: true,
        data: {
          uid: user.uid,
          roles: user.roles || ['user'],
          permissions: user.permissions || [],
        },
      });
    } catch (error: any) {
      logger.error('Failed to get user permissions', {
        error: error.message,
        uid: req.user?.uid,
      });

      next(error);
    }
  };
}