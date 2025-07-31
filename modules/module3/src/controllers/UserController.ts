import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { NotFoundError, AuthorizationError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class UserController {
  // 사용자 목록 조회
  static getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 20, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      let query: any = admin.firestore().collection('users');

      // 필터링
      if (role) {
        query = query.where('roles', 'array-contains', role);
      }
      if (status) {
        query = query.where('status', '==', status);
      }

      // 정렬
      query = query.orderBy(sortBy as string, sortOrder as 'asc' | 'desc');

      // 페이지네이션
      const offset = (Number(page) - 1) * Number(limit);
      query = query.offset(offset).limit(Number(limit));

      const snapshot = await query.get();
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 총 사용자 수 조회
      const totalSnapshot = await admin.firestore().collection('users').get();
      const total = totalSnapshot.size;

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      logger.error('Failed to get users', { error: error.message });
      next(error);
    }
  };

  // 특정 사용자 조회
  static getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        return next(new NotFoundError('User not found'));
      }

      const userData = userDoc.data();
      
      res.json({
        success: true,
        data: {
          id: userDoc.id,
          ...userData,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get user', { error: error.message, userId: req.params.userId });
      next(error);
    }
  };

  // 사용자 정보 업데이트
  static updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Firebase Auth 업데이트
      const authUpdates: any = {};
      if (updates.displayName) authUpdates.displayName = updates.displayName;
      if (updates.phoneNumber) authUpdates.phoneNumber = updates.phoneNumber;

      if (Object.keys(authUpdates).length > 0) {
        await admin.auth().updateUser(userId, authUpdates);
      }

      // Firestore 업데이트
      const firestoreUpdates = {
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update(firestoreUpdates);

      logger.business('User updated', {
        userId,
        updatedBy: req.user?.uid,
        updates: Object.keys(updates),
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updates,
      });
    } catch (error: any) {
      logger.error('Failed to update user', { 
        error: error.message, 
        userId: req.params.userId,
        updates: req.body 
      });
      next(error);
    }
  };

  // 사용자 삭제
  static deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;

      // Firebase Auth에서 사용자 삭제
      await admin.auth().deleteUser(userId);

      // Firestore에서 사용자 데이터 삭제
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .delete();

      logger.business('User deleted', {
        userId,
        deletedBy: req.user?.uid,
      });

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      logger.error('Failed to delete user', { 
        error: error.message, 
        userId: req.params.userId 
      });
      next(error);
    }
  };

  // 사용자 상태 토글
  static toggleUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      // Firebase Auth에서 사용자 비활성화/활성화
      await admin.auth().updateUser(userId, {
        disabled: status === 'inactive',
      });

      // Firestore 상태 업데이트
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      logger.business('User status changed', {
        userId,
        newStatus: status,
        changedBy: req.user?.uid,
      });

      res.json({
        success: true,
        message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
        data: { status },
      });
    } catch (error: any) {
      logger.error('Failed to toggle user status', { 
        error: error.message, 
        userId: req.params.userId 
      });
      next(error);
    }
  };

  // 사용자 역할 업데이트
  static updateUserRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { roles } = req.body;

      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          roles,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      logger.business('User roles updated', {
        userId,
        newRoles: roles,
        updatedBy: req.user?.uid,
      });

      res.json({
        success: true,
        message: 'User roles updated successfully',
        data: { roles },
      });
    } catch (error: any) {
      logger.error('Failed to update user roles', { 
        error: error.message, 
        userId: req.params.userId 
      });
      next(error);
    }
  };

  // 사용자 권한 업데이트
  static updateUserPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;

      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          permissions,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      logger.business('User permissions updated', {
        userId,
        newPermissions: permissions,
        updatedBy: req.user?.uid,
      });

      res.json({
        success: true,
        message: 'User permissions updated successfully',
        data: { permissions },
      });
    } catch (error: any) {
      logger.error('Failed to update user permissions', { 
        error: error.message, 
        userId: req.params.userId 
      });
      next(error);
    }
  };

  // 사용자 활동 로그 조회
  static getUserActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;

      // 실제 구현에서는 활동 로그 컬렉션에서 조회
      const activitySnapshot = await admin.firestore()
        .collection('user_activities')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(Number(limit))
        .get();

      const activities = activitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({
        success: true,
        data: {
          userId,
          activities,
          total: activities.length,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get user activity', { 
        error: error.message, 
        userId: req.params.userId 
      });
      next(error);
    }
  };

  // 사용자 통계 조회
  static getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;

      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        return next(new NotFoundError('User not found'));
      }

      const userData = userDoc.data();

      // 기본 통계 (실제 구현에서는 더 복잡한 통계 계산)
      const stats = {
        userId,
        accountAge: userData?.createdAt ? 
          Math.floor((Date.now() - userData.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24)) 
          : 0,
        lastLogin: userData?.lastLoginAt?.toDate() || null,
        status: userData?.status || 'unknown',
        roles: userData?.roles || [],
        permissions: userData?.permissions || [],
        profileCompleteness: calculateProfileCompleteness(userData),
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      logger.error('Failed to get user stats', { 
        error: error.message, 
        userId: req.params.userId 
      });
      next(error);
    }
  };
}

// 헬퍼 함수: 프로필 완성도 계산
function calculateProfileCompleteness(userData: any): number {
  const fields = ['displayName', 'email', 'phoneNumber', 'profile.bio', 'profile.avatar'];
  let completed = 0;

  fields.forEach(field => {
    const value = field.includes('.') 
      ? field.split('.').reduce((obj, key) => obj?.[key], userData)
      : userData?.[field];
    
    if (value && value !== '') {
      completed++;
    }
  });

  return Math.round((completed / fields.length) * 100);
}