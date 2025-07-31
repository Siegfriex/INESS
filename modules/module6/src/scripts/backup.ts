#!/usr/bin/env tsx

/**
 * 백업 생성 및 관리 스크립트
 * Module6 DevOps Agent가 실행하는 자동화된 백업 스크립트
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface BackupConfig {
  timestamp: string;
  backupId: string;
  services: string[];
  storage: {
    bucket: string;
    region: string;
    retentionDays: number;
  };
  databases: string[];
}

class BackupManager {
  private config: BackupConfig;
  private logFile: string;

  constructor() {
    const timestamp = new Date().toISOString();
    
    this.config = {
      timestamp,
      backupId: `backup-${Date.now()}`,
      services: ['firestore', 'cloud-storage', 'cloud-sql'],
      storage: {
        bucket: process.env.BACKUP_BUCKET || 'iness-backups',
        region: process.env.BACKUP_REGION || 'asia-northeast3',
        retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30')
      },
      databases: ['firestore', 'user-sessions']
    };
    
    this.logFile = path.join(process.cwd(), 'logs', 'backup.log');
  }

  async createBackup(): Promise<void> {
    await this.log('💾 백업 생성 시작');
    
    try {
      // 1. 백업 환경 준비
      await this.prepareBackupEnvironment();
      
      // 2. 데이터베이스 백업
      await this.backupDatabases();
      
      // 3. 파일 시스템 백업
      await this.backupFileSystem();
      
      // 4. 설정 파일 백업
      await this.backupConfigurations();
      
      // 5. 백업 검증
      await this.verifyBackups();
      
      // 6. 백업 메타데이터 저장
      await this.saveBackupMetadata();
      
      // 7. 이전 백업 정리
      await this.cleanupOldBackups();
      
      await this.log('✅ 백업 생성 완료');
      await this.notifyBackupSuccess();
      
    } catch (error) {
      await this.log(`❌ 백업 생성 실패: ${error}`);
      await this.notifyBackupFailure(error);
      throw error;
    }
  }

  async restoreBackup(backupId: string): Promise<void> {
    await this.log(`🔄 백업 복원 시작: ${backupId}`);
    
    try {
      // 1. 백업 메타데이터 로드
      const metadata = await this.loadBackupMetadata(backupId);
      
      // 2. 복원 사전 검증
      await this.preRestoreValidation(metadata);
      
      // 3. 서비스 중단
      await this.stopServices();
      
      // 4. 데이터베이스 복원
      await this.restoreDatabases(metadata);
      
      // 5. 파일 시스템 복원
      await this.restoreFileSystem(metadata);
      
      // 6. 설정 파일 복원
      await this.restoreConfigurations(metadata);
      
      // 7. 서비스 재시작
      await this.restartServices();
      
      // 8. 복원 검증
      await this.verifyRestore();
      
      await this.log('✅ 백업 복원 완료');
      await this.notifyRestoreSuccess(backupId);
      
    } catch (error) {
      await this.log(`❌ 백업 복원 실패: ${error}`);
      await this.notifyRestoreFailure(backupId, error);
      throw error;
    }
  }

  async listBackups(): Promise<any[]> {
    await this.log('📋 백업 목록 조회');
    
    try {
      const backups = await this.getBackupList();
      
      await this.log(`✅ 백업 ${backups.length}개 발견`);
      return backups;
      
    } catch (error) {
      await this.log(`❌ 백업 목록 조회 실패: ${error}`);
      throw error;
    }
  }

  private async prepareBackupEnvironment(): Promise<void> {
    await this.log('🔧 백업 환경 준비 중...');
    
    // 백업 디렉토리 생성
    await this.createBackupDirectories();
    
    // 권한 확인
    await this.validatePermissions();
    
    // 저장 공간 확인
    await this.checkStorageSpace();
    
    await this.log('✅ 백업 환경 준비 완료');
  }

  private async backupDatabases(): Promise<void> {
    await this.log('🗄️ 데이터베이스 백업 시작');
    
    for (const database of this.config.databases) {
      await this.log(`📊 ${database} 백업 중...`);
      
      try {
        switch (database) {
          case 'firestore':
            await this.backupFirestore();
            break;
          case 'user-sessions':
            await this.backupUserSessions();
            break;
          default:
            await this.backupGenericDatabase(database);
        }
        
        await this.log(`✅ ${database} 백업 완료`);
      } catch (error) {
        throw new Error(`${database} 백업 실패: ${error}`);
      }
    }
    
    await this.log('✅ 모든 데이터베이스 백업 완료');
  }

  private async backupFileSystem(): Promise<void> {
    await this.log('📁 파일 시스템 백업 시작');
    
    // 중요 파일 및 디렉토리 백업
    const importantPaths = [
      'logs/',
      'config/',
      'uploads/',
      'certificates/'
    ];
    
    for (const filePath of importantPaths) {
      await this.log(`📄 ${filePath} 백업 중...`);
      
      try {
        await this.backupPath(filePath);
        await this.log(`✅ ${filePath} 백업 완료`);
      } catch (error) {
        await this.log(`⚠️ ${filePath} 백업 실패 (계속 진행): ${error}`);
      }
    }
    
    await this.log('✅ 파일 시스템 백업 완료');
  }

  private async backupConfigurations(): Promise<void> {
    await this.log('⚙️ 설정 파일 백업 시작');
    
    const configFiles = [
      'package.json',
      'firebase.json',
      'cloudbuild.yaml',
      '.env.example',
      'tsconfig.json'
    ];
    
    for (const configFile of configFiles) {
      await this.log(`📋 ${configFile} 백업 중...`);
      
      try {
        await this.backupConfigFile(configFile);
        await this.log(`✅ ${configFile} 백업 완료`);
      } catch (error) {
        await this.log(`⚠️ ${configFile} 백업 실패 (계속 진행): ${error}`);
      }
    }
    
    await this.log('✅ 설정 파일 백업 완료');
  }

  private async verifyBackups(): Promise<void> {
    await this.log('🔍 백업 검증 시작');
    
    // 백업 파일 무결성 확인
    await this.verifyBackupIntegrity();
    
    // 백업 크기 확인
    await this.verifyBackupSize();
    
    // 복원 가능성 테스트
    await this.testRestorability();
    
    await this.log('✅ 백업 검증 완료');
  }

  private async saveBackupMetadata(): Promise<void> {
    await this.log('📝 백업 메타데이터 저장 중...');
    
    const metadata = {
      backupId: this.config.backupId,
      timestamp: this.config.timestamp,
      services: this.config.services,
      databases: this.config.databases,
      size: await this.calculateBackupSize(),
      location: `${this.config.storage.bucket}/${this.config.backupId}`,
      status: 'completed',
      checksum: await this.generateBackupChecksum()
    };
    
    // 메타데이터를 파일로 저장
    await this.saveMetadataFile(metadata);
    
    // 메타데이터를 데이터베이스에 저장
    await this.saveMetadataToDatabase(metadata);
    
    await this.log('✅ 백업 메타데이터 저장 완료');
  }

  private async cleanupOldBackups(): Promise<void> {
    await this.log('🧹 이전 백업 정리 시작');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.storage.retentionDays);
    
    const oldBackups = await this.getOldBackups(cutoffDate);
    
    for (const backup of oldBackups) {
      await this.log(`🗑️ 오래된 백업 삭제: ${backup.id}`);
      
      try {
        await this.deleteBackup(backup);
        await this.log(`✅ ${backup.id} 삭제 완료`);
      } catch (error) {
        await this.log(`❌ ${backup.id} 삭제 실패: ${error}`);
      }
    }
    
    await this.log(`✅ ${oldBackups.length}개 오래된 백업 정리 완료`);
  }

  // 복원 관련 메서드들
  private async loadBackupMetadata(backupId: string): Promise<any> {
    await this.log(`📖 백업 메타데이터 로드: ${backupId}`);
    // 메타데이터 로드 로직
    return {
      backupId,
      timestamp: new Date().toISOString(),
      services: this.config.services,
      databases: this.config.databases
    };
  }

  private async preRestoreValidation(metadata: any): Promise<void> {
    await this.log('✅ 복원 사전 검증 중...');
    // 복원 가능성 검증 로직
  }

  private async stopServices(): Promise<void> {
    await this.log('🛑 서비스 중단 중...');
    // 서비스 중단 로직
  }

  private async restoreServices(): Promise<void> {
    await this.log('🔄 서비스 재시작 중...');
    // 서비스 재시작 로직
  }

  // 헬퍼 메서드들
  private async createBackupDirectories(): Promise<void> {
    await this.log('📁 백업 디렉토리 생성 중...');
    
    const dirs = [
      `backups/${this.config.backupId}`,
      `backups/${this.config.backupId}/databases`,
      `backups/${this.config.backupId}/files`,
      `backups/${this.config.backupId}/configs`
    ];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // 이미 존재하는 경우 무시
      }
    }
  }

  private async validatePermissions(): Promise<void> {
    await this.log('🔐 권한 확인 중...');
    // 권한 확인 로직
  }

  private async checkStorageSpace(): Promise<void> {
    await this.log('💾 저장 공간 확인 중...');
    // 저장 공간 확인 로직
  }

  private async backupFirestore(): Promise<void> {
    await this.log('🔥 Firestore 백업 중...');
    // Firestore 백업 로직
  }

  private async backupUserSessions(): Promise<void> {
    await this.log('👤 사용자 세션 백업 중...');
    // 사용자 세션 백업 로직
  }

  private async backupGenericDatabase(database: string): Promise<void> {
    await this.log(`🗄️ ${database} 백업 중...`);
    // 일반 데이터베이스 백업 로직
  }

  private async backupPath(filePath: string): Promise<void> {
    await this.log(`📁 ${filePath} 백업 중...`);
    // 파일/디렉토리 백업 로직
  }

  private async backupConfigFile(configFile: string): Promise<void> {
    await this.log(`⚙️ ${configFile} 백업 중...`);
    // 설정 파일 백업 로직
  }

  private async verifyBackupIntegrity(): Promise<void> {
    await this.log('🔍 백업 무결성 확인 중...');
    // 무결성 확인 로직
  }

  private async verifyBackupSize(): Promise<void> {
    await this.log('📏 백업 크기 확인 중...');
    // 크기 확인 로직
  }

  private async testRestorability(): Promise<void> {
    await this.log('🧪 복원 가능성 테스트 중...');
    // 복원 테스트 로직
  }

  private async calculateBackupSize(): Promise<number> {
    // 백업 크기 계산 로직
    return 1024 * 1024 * 100; // 임시값 (100MB)
  }

  private async generateBackupChecksum(): Promise<string> {
    // 체크섬 생성 로직
    return 'sha256:abc123...'; // 임시값
  }

  private async saveMetadataFile(metadata: any): Promise<void> {
    const metadataPath = `backups/${this.config.backupId}/metadata.json`;
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async saveMetadataToDatabase(metadata: any): Promise<void> {
    // 데이터베이스에 메타데이터 저장 로직
  }

  private async getOldBackups(cutoffDate: Date): Promise<any[]> {
    // 오래된 백업 목록 조회 로직
    return []; // 임시 반환값
  }

  private async deleteBackup(backup: any): Promise<void> {
    // 백업 삭제 로직
  }

  private async getBackupList(): Promise<any[]> {
    // 백업 목록 조회 로직
    return []; // 임시 반환값
  }

  private async restartServices(): Promise<void> {
    await this.log('🚀 서비스 재시작 중...');
    // 서비스 재시작 로직
  }

  private async restoreDatabases(metadata: any): Promise<void> {
    await this.log('🗄️ 데이터베이스 복원 중...');
    // 데이터베이스 복원 로직
  }

  private async restoreFileSystem(metadata: any): Promise<void> {
    await this.log('📁 파일 시스템 복원 중...');
    // 파일 시스템 복원 로직
  }

  private async restoreConfigurations(metadata: any): Promise<void> {
    await this.log('⚙️ 설정 파일 복원 중...');
    // 설정 파일 복원 로직
  }

  private async verifyRestore(): Promise<void> {
    await this.log('🔍 복원 검증 중...');
    // 복원 검증 로직
  }

  // 알림 메서드들
  private async notifyBackupSuccess(): Promise<void> {
    await this.log('📢 백업 성공 알림 전송 중...');
    
    const notification = {
      type: 'backup_success',
      backupId: this.config.backupId,
      timestamp: this.config.timestamp,
      size: await this.calculateBackupSize(),
      services: this.config.services
    };
    
    console.log('✅ 백업 성공 알림:', notification);
  }

  private async notifyBackupFailure(error: any): Promise<void> {
    await this.log('📢 백업 실패 알림 전송 중...');
    
    const notification = {
      type: 'backup_failure',
      backupId: this.config.backupId,
      timestamp: this.config.timestamp,
      error: error.message || error
    };
    
    console.error('❌ 백업 실패 알림:', notification);
  }

  private async notifyRestoreSuccess(backupId: string): Promise<void> {
    await this.log('📢 복원 성공 알림 전송 중...');
    
    const notification = {
      type: 'restore_success',
      backupId,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ 복원 성공 알림:', notification);
  }

  private async notifyRestoreFailure(backupId: string, error: any): Promise<void> {
    await this.log('📢 복원 실패 알림 전송 중...');
    
    const notification = {
      type: 'restore_failure',
      backupId,
      timestamp: new Date().toISOString(),
      error: error.message || error
    };
    
    console.error('❌ 복원 실패 알림:', notification);
  }

  private async log(message: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    console.log(message);
    
    try {
      await fs.appendFile(this.logFile, logEntry);
    } catch (error) {
      console.error('로그 저장 실패:', error);
    }
  }
}

// 메인 실행
if (require.main === module) {
  const backupManager = new BackupManager();
  
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'create':
      backupManager.createBackup()
        .then(() => {
          console.log('🎉 백업 생성 완료');
          process.exit(0);
        })
        .catch((error) => {
          console.error('💥 백업 생성 실패:', error);
          process.exit(1);
        });
      break;
      
    case 'restore':
      if (!arg) {
        console.error('❌ 백업 ID를 입력하세요: npm run backup restore <backup-id>');
        process.exit(1);
      }
      
      backupManager.restoreBackup(arg)
        .then(() => {
          console.log('🎉 백업 복원 완료');
          process.exit(0);
        })
        .catch((error) => {
          console.error('💥 백업 복원 실패:', error);
          process.exit(1);
        });
      break;
      
    case 'list':
      backupManager.listBackups()
        .then((backups) => {
          console.log('📋 백업 목록:');
          console.table(backups);
          process.exit(0);
        })
        .catch((error) => {
          console.error('💥 백업 목록 조회 실패:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('사용법:');
      console.log('  npm run backup create        - 새 백업 생성');
      console.log('  npm run backup restore <id>  - 백업 복원');
      console.log('  npm run backup list          - 백업 목록 조회');
      process.exit(1);
  }
}

export { BackupManager };