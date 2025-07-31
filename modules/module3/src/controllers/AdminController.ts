import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { logger } from '../utils/logger.js';

export class AdminController {
  // 시스템 대시보드 데이터
  static getDashboardData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 사용자 통계
      const usersSnapshot = await admin.firestore().collection('users').get();
      const activeUsers = usersSnapshot.docs.filter(doc => doc.data().status === 'active').length;
      
      const dashboardData = {
        timestamp: new Date().toISOString(),
        stats: {
          totalUsers: usersSnapshot.size,
          activeUsers,
          inactiveUsers: usersSnapshot.size - activeUsers,
          newUsersToday: 0, // 실제 구현 필요
          totalApiCalls: 0, // 실제 구현 필요
          errorRate: 0, // 실제 구현 필요
        },
        system: {
          uptime: process.uptime(),
          memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development',
        },
      };

      res.json({
        success: true,
        data: dashboardData,
      });
    } catch (error: any) {
      logger.error('Failed to get dashboard data', { error: error.message });
      next(error);
    }
  };

  // 전체 시스템 통계
  static getSystemStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = {
        timestamp: new Date().toISOString(),
        period: 'last_30_days',
        users: {
          total: 0,
          active: 0,
          newRegistrations: 0,
          deletions: 0,
        },
        api: {
          totalRequests: 0,
          avgResponseTime: 0,
          errorRate: 0,
          topEndpoints: [],
        },
        security: {
          failedLogins: 0,
          blockedIPs: 0,
          suspiciousActivity: 0,
        },
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      logger.error('Failed to get system statistics', { error: error.message });
      next(error);
    }
  };

  // 관리자용 모든 사용자 조회
  static getAllUsersAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const snapshot = await admin.firestore().collection('users').get();
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({
        success: true,
        data: {
          users,
          total: users.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error('Failed to get all users (admin)', { error: error.message });
      next(error);
    }
  };

  // 사용자 일괄 처리
  static bulkUserAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { action, userIds, reason } = req.body;
      const results = { success: [], failed: [] };

      for (const userId of userIds) {
        try {
          switch (action) {
            case 'activate':
              await admin.auth().updateUser(userId, { disabled: false });
              await admin.firestore().collection('users').doc(userId).update({ status: 'active' });
              break;
            case 'deactivate':
              await admin.auth().updateUser(userId, { disabled: true });
              await admin.firestore().collection('users').doc(userId).update({ status: 'inactive' });
              break;
            case 'delete':
              await admin.auth().deleteUser(userId);
              await admin.firestore().collection('users').doc(userId).delete();
              break;
          }
          (results.success as string[]).push(userId);
        } catch (error) {
          (results.failed as string[]).push(userId);
        }
      }

      logger.business('Bulk user action performed', {
        action,
        userIds,
        reason,
        results,
        adminUid: req.user?.uid,
      });

      res.json({
        success: true,
        message: `Bulk ${action} completed`,
        data: results,
      });
    } catch (error: any) {
      logger.error('Failed to perform bulk user action', { error: error.message });
      next(error);
    }
  };

  // 모든 역할 조회
  static getAllRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rolesSnapshot = await admin.firestore().collection('roles').get();
      const roles = rolesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({
        success: true,
        data: { roles },
      });
    } catch (error: any) {
      logger.error('Failed to get all roles', { error: error.message });
      next(error);
    }
  };

  // 역할 생성
  static createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roleData = {
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: req.user?.uid,
      };

      const docRef = await admin.firestore().collection('roles').add(roleData);

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: { id: docRef.id, ...roleData },
      });
    } catch (error: any) {
      logger.error('Failed to create role', { error: error.message });
      next(error);
    }
  };

  // 역할 업데이트
  static updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleId } = req.params;
      const updates = {
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: req.user?.uid,
      };

      await admin.firestore().collection('roles').doc(roleId).update(updates);

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: updates,
      });
    } catch (error: any) {
      logger.error('Failed to update role', { error: error.message });
      next(error);
    }
  };

  // 역할 삭제
  static deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleId } = req.params;
      await admin.firestore().collection('roles').doc(roleId).delete();

      res.json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error: any) {
      logger.error('Failed to delete role', { error: error.message });
      next(error);
    }
  };

  // 모든 권한 조회
  static getAllPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permissionsSnapshot = await admin.firestore().collection('permissions').get();
      const permissions = permissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({
        success: true,
        data: { permissions },
      });
    } catch (error: any) {
      logger.error('Failed to get all permissions', { error: error.message });
      next(error);
    }
  };

  // 권한 생성
  static createPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permissionData = {
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: req.user?.uid,
      };

      const docRef = await admin.firestore().collection('permissions').add(permissionData);

      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: { id: docRef.id, ...permissionData },
      });
    } catch (error: any) {
      logger.error('Failed to create permission', { error: error.message });
      next(error);
    }
  };

  // 시스템 설정 조회
  static getSystemSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settingsDoc = await admin.firestore().collection('system').doc('settings').get();
      const settings = settingsDoc.exists ? settingsDoc.data() : {};

      res.json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      logger.error('Failed to get system settings', { error: error.message });
      next(error);
    }
  };

  // 시스템 설정 업데이트
  static updateSystemSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updates = {
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: req.user?.uid,
      };

      await admin.firestore().collection('system').doc('settings').set(updates, { merge: true });

      res.json({
        success: true,
        message: 'System settings updated successfully',
        data: updates,
      });
    } catch (error: any) {
      logger.error('Failed to update system settings', { error: error.message });
      next(error);
    }
  };

  // 시스템 로그 조회
  static getSystemLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        message: 'System logs endpoint - implementation needed',
        data: { logs: [] },
      });
    } catch (error: any) {
      logger.error('Failed to get system logs', { error: error.message });
      next(error);
    }
  };

  // 시스템 로그 클리어
  static clearSystemLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        message: 'System logs cleared - implementation needed',
      });
    } catch (error: any) {
      logger.error('Failed to clear system logs', { error: error.message });
      next(error);
    }
  };

  // 백업 생성
  static createBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        message: 'Backup creation - implementation needed',
        data: { backupId: 'backup_' + Date.now() },
      });
    } catch (error: any) {
      logger.error('Failed to create backup', { error: error.message });
      next(error);
    }
  };

  // 백업 목록 조회
  static getBackupList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: { backups: [] },
      });
    } catch (error: any) {
      logger.error('Failed to get backup list', { error: error.message });
      next(error);
    }
  };

  // 백업 복원
  static restoreBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { backupId } = req.params;
      res.json({
        success: true,
        message: `Backup ${backupId} restoration - implementation needed`,
      });
    } catch (error: any) {
      logger.error('Failed to restore backup', { error: error.message });
      next(error);
    }
  };

  // 보안 이벤트 조회
  static getSecurityEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: { events: [] },
      });
    } catch (error: any) {
      logger.error('Failed to get security events', { error: error.message });
      next(error);
    }
  };

  // API 사용량 통계
  static getApiUsageStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: { usage: {} },
      });
    } catch (error: any) {
      logger.error('Failed to get API usage stats', { error: error.message });
      next(error);
    }
  };

  // 유지보수 모드 시작
  static startMaintenanceMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await admin.firestore().collection('system').doc('settings').update({
        'maintenance.enabled': true,
        'maintenance.startedAt': admin.firestore.FieldValue.serverTimestamp(),
        'maintenance.startedBy': req.user?.uid,
      });

      res.json({
        success: true,
        message: 'Maintenance mode started',
      });
    } catch (error: any) {
      logger.error('Failed to start maintenance mode', { error: error.message });
      next(error);
    }
  };

  // 유지보수 모드 종료
  static stopMaintenanceMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await admin.firestore().collection('system').doc('settings').update({
        'maintenance.enabled': false,
        'maintenance.endedAt': admin.firestore.FieldValue.serverTimestamp(),
        'maintenance.endedBy': req.user?.uid,
      });

      res.json({
        success: true,
        message: 'Maintenance mode stopped',
      });
    } catch (error: any) {
      logger.error('Failed to stop maintenance mode', { error: error.message });
      next(error);
    }
  };

  // 캐시 클리어
  static clearCache = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        message: 'Cache cleared - implementation needed',
      });
    } catch (error: any) {
      logger.error('Failed to clear cache', { error: error.message });
      next(error);
    }
  };
}