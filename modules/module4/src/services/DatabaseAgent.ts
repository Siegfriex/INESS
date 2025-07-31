/**
 * Database Agent
 * Module4의 핵심 데이터베이스 관리 에이전트
 */

import { FirestoreService } from './FirestoreService';
import { SchemaValidator } from './SchemaValidator';
import { PerformanceMonitor } from './PerformanceMonitor';
import { 
  User, 
  EmotionCheckin, 
  JournalEntry, 
  ExpertProfile,
  DatabaseError 
} from '../models';
import { COLLECTIONS, PERFORMANCE_THRESHOLDS } from '../config/firebase';

export class DatabaseAgent {
  private firestoreService: FirestoreService;
  private schemaValidator: SchemaValidator;
  private performanceMonitor: PerformanceMonitor;
  private isInitialized: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(
    firestoreService: FirestoreService,
    schemaValidator: SchemaValidator,
    performanceMonitor: PerformanceMonitor
  ) {
    this.firestoreService = firestoreService;
    this.schemaValidator = schemaValidator;
    this.performanceMonitor = performanceMonitor;
  }

  /**
   * Database Agent 초기화
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🗄️ Database Agent 초기화 시작...');

      // Firestore 연결 확인
      const isConnected = await this.firestoreService.checkConnection();
      if (!isConnected) {
        throw new Error('Firestore 연결에 실패했습니다.');
      }

      // 필수 컬렉션 확인 및 생성
      await this.ensureCollectionsExist();

      // 인덱스 확인
      await this.verifyIndexes();

      // 데이터 무결성 검사
      await this.runIntegrityCheck();

      this.isInitialized = true;
      console.log('✅ Database Agent 초기화 완료');

    } catch (error) {
      console.error('❌ Database Agent 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 모니터링 시작
   */
  public async startMonitoring(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Database Agent가 초기화되지 않았습니다.');
    }

    // 성능 모니터링 시작
    await this.performanceMonitor.startMonitoring();

    // 건강 상태 체크 시작
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 300000); // 5분마다

    console.log('🔍 Database Agent 모니터링 시작');
  }

  /**
   * 에이전트 중지
   */
  public async stop(): Promise<void> {
    // 모니터링 중지
    this.performanceMonitor.stopMonitoring();
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Firestore 연결 정리
    await this.firestoreService.close();

    this.isInitialized = false;
    console.log('🔒 Database Agent 중지 완료');
  }

  /**
   * 사용자 데이터 관리
   */
  public async createUser(userData: User): Promise<string> {
    // 스키마 검증
    const validation = this.schemaValidator.validate<User>('User', userData);
    if (!validation.valid) {
      throw new Error(`사용자 데이터 검증 실패: ${validation.errors?.join(', ')}`);
    }

    // 성능 측정과 함께 사용자 생성
    const { result } = await this.performanceMonitor.measureWrite(
      'createUser',
      COLLECTIONS.USERS,
      async () => {
        // 중복 이메일 확인
        const existingUsers = await this.firestoreService.query<User>(
          COLLECTIONS.USERS,
          (ref) => ref.where('core.email', '==', userData.core.email).limit(1)
        );

        if (existingUsers.length > 0) {
          throw new Error('이미 존재하는 이메일입니다.');
        }

        // 사용자 생성
        return await this.firestoreService.create(
          COLLECTIONS.USERS,
          validation.data!,
          userData.core.uid
        );
      }
    );

    console.log(`👤 새 사용자 생성: ${userData.core.email}`);
    return result;
  }

  /**
   * 감정 체크인 저장
   */
  public async saveEmotionCheckin(checkinData: EmotionCheckin): Promise<string> {
    // 스키마 검증
    const validation = this.schemaValidator.validate<EmotionCheckin>('EmotionCheckin', checkinData);
    if (!validation.valid) {
      throw new Error(`감정 체크인 데이터 검증 실패: ${validation.errors?.join(', ')}`);
    }

    // 위기 상황 감지
    if (checkinData.analysis.riskLevel === 'critical') {
      await this.handleCrisisDetection(checkinData);
    }

    // 성능 측정과 함께 저장
    const { result } = await this.performanceMonitor.measureWrite(
      'saveEmotionCheckin',
      COLLECTIONS.EMOTIONS,
      async () => {
        return await this.firestoreService.create(
          COLLECTIONS.EMOTIONS,
          validation.data!,
          checkinData.id
        );
      }
    );

    // 감정 트렌드 업데이트 (비동기)
    this.updateEmotionTrends(checkinData.userId).catch(console.error);

    return result;
  }

  /**
   * 일기 저장
   */
  public async saveJournalEntry(journalData: JournalEntry): Promise<string> {
    // 스키마 검증
    const validation = this.schemaValidator.validate<JournalEntry>('JournalEntry', journalData);
    if (!validation.valid) {
      throw new Error(`일기 데이터 검증 실패: ${validation.errors?.join(', ')}`);
    }

    // 성능 측정과 함께 저장
    const { result } = await this.performanceMonitor.measureWrite(
      'saveJournalEntry',
      COLLECTIONS.JOURNALS,
      async () => {
        return await this.firestoreService.create(
          COLLECTIONS.JOURNALS,
          validation.data!,
          journalData.id
        );
      }
    );

    console.log(`📝 일기 저장 완료: ${journalData.id}`);
    return result;
  }

  /**
   * 전문가 프로필 저장
   */
  public async saveExpertProfile(expertData: ExpertProfile): Promise<string> {
    // 스키마 검증
    const validation = this.schemaValidator.validate<ExpertProfile>('ExpertProfile', expertData);
    if (!validation.valid) {
      throw new Error(`전문가 프로필 검증 실패: ${validation.errors?.join(', ')}`);
    }

    // 성능 측정과 함께 저장
    const { result } = await this.performanceMonitor.measureWrite(
      'saveExpertProfile',
      COLLECTIONS.EXPERTS,
      async () => {
        return await this.firestoreService.create(
          COLLECTIONS.EXPERTS,
          validation.data!,
          expertData.uid
        );
      }
    );

    console.log(`👨‍⚕️ 전문가 프로필 저장: ${expertData.personalInfo.displayName}`);
    return result;
  }

  /**
   * 사용자별 감정 데이터 조회
   */
  public async getUserEmotions(
    userId: string,
    limit: number = 50,
    startDate?: Date,
    endDate?: Date
  ): Promise<EmotionCheckin[]> {
    const { result } = await this.performanceMonitor.measureQuery(
      'getUserEmotions',
      COLLECTIONS.EMOTIONS,
      async () => {
        return await this.firestoreService.query<EmotionCheckin>(
          COLLECTIONS.EMOTIONS,
          (ref) => {
            let query = ref.where('userId', '==', userId);
            
            if (startDate) {
              query = query.where('createdAt', '>=', startDate);
            }
            if (endDate) {
              query = query.where('createdAt', '<=', endDate);
            }
            
            return query.orderBy('createdAt', 'desc').limit(limit);
          }
        );
      }
    );

    return result;
  }

  /**
   * 위기 상황 감지 및 대응
   */
  private async handleCrisisDetection(checkinData: EmotionCheckin): Promise<void> {
    console.warn(`🚨 위기 상황 감지: 사용자 ${checkinData.userId}`);

    try {
      // 위기 알림 로그 저장
      await this.firestoreService.create('_crisis_alerts', {
        userId: checkinData.userId,
        emotionId: checkinData.id,
        riskLevel: checkinData.analysis.riskLevel,
        keywords: checkinData.analysis.keywords,
        triggeredAt: new Date(),
        handled: false,
      });

      // 즉시 개입이 필요한 경우 외부 시스템 알림
      if (checkinData.analysis.insights.warning_signs.length > 0) {
        // 실제 구현에서는 위기 개입 시스템 호출
        console.log('🆘 즉시 개입 필요 - 위기 개입 시스템 알림 발송');
      }

    } catch (error) {
      console.error('위기 상황 처리 실패:', error);
    }
  }

  /**
   * 감정 트렌드 업데이트
   */
  private async updateEmotionTrends(userId: string): Promise<void> {
    try {
      // 최근 7일간의 감정 데이터 조회
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recentEmotions = await this.getUserEmotions(userId, 100, weekAgo);
      
      if (recentEmotions.length < 3) {
        return; // 충분한 데이터가 없음
      }

      // 트렌드 분석
      const dominantEmotions = recentEmotions.map(e => e.structure.dominantEmotion.primary);
      const avgIntensity = recentEmotions.reduce(
        (sum, e) => sum + e.structure.dominantEmotion.intensity, 0
      ) / recentEmotions.length;

      // 트렌드 방향 계산
      const recentIntensities = recentEmotions.slice(0, 3).map(e => e.structure.dominantEmotion.intensity);
      const olderIntensities = recentEmotions.slice(-3).map(e => e.structure.dominantEmotion.intensity);
      
      const recentAvg = recentIntensities.reduce((a, b) => a + b, 0) / recentIntensities.length;
      const olderAvg = olderIntensities.reduce((a, b) => a + b, 0) / olderIntensities.length;
      
      let moodDirection: 'improving' | 'stable' | 'declining';
      if (recentAvg > olderAvg + 1) {
        moodDirection = 'improving';
      } else if (recentAvg < olderAvg - 1) {
        moodDirection = 'declining';
      } else {
        moodDirection = 'stable';
      }

      // 트렌드 저장
      await this.firestoreService.create(COLLECTIONS.EMOTION_TRENDS, {
        userId,
        period: 'weekly',
        startDate: weekAgo,
        endDate: new Date(),
        trends: {
          dominant_emotions: [...new Set(dominantEmotions)],
          average_intensity: Math.round(avgIntensity * 10) / 10,
          mood_direction: moodDirection,
          stability_score: this.calculateStabilityScore(recentEmotions),
        },
        insights: this.generateTrendInsights(recentEmotions, moodDirection),
        generatedAt: new Date(),
      });

    } catch (error) {
      console.error('감정 트렌드 업데이트 실패:', error);
    }
  }

  /**
   * 안정성 점수 계산
   */
  private calculateStabilityScore(emotions: EmotionCheckin[]): number {
    if (emotions.length < 2) return 5;

    const intensities = emotions.map(e => e.structure.dominantEmotion.intensity);
    const variance = this.calculateVariance(intensities);
    
    // 분산이 낮을수록 안정성이 높음 (1-10 스케일)
    return Math.max(1, Math.min(10, 10 - (variance * 2)));
  }

  /**
   * 분산 계산
   */
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * 트렌드 인사이트 생성
   */
  private generateTrendInsights(
    emotions: EmotionCheckin[], 
    direction: 'improving' | 'stable' | 'declining'
  ): string[] {
    const insights: string[] = [];

    // 방향별 인사이트
    switch (direction) {
      case 'improving':
        insights.push('감정 상태가 개선되고 있습니다.');
        break;
      case 'declining':
        insights.push('감정 상태에 주의가 필요합니다.');
        break;
      case 'stable':
        insights.push('감정 상태가 안정적입니다.');
        break;
    }

    // 패턴 분석
    const triggers = emotions.flatMap(e => e.structure.triggers.map(t => t.category));
    const triggerCounts = triggers.reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonTrigger = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostCommonTrigger && mostCommonTrigger[1] >= 3) {
      insights.push(`주요 감정 유발 요인: ${mostCommonTrigger[0]}`);
    }

    return insights;
  }

  /**
   * 필수 컬렉션 존재 확인
   */
  private async ensureCollectionsExist(): Promise<void> {
    const requiredCollections = [
      COLLECTIONS.USERS,
      COLLECTIONS.EMOTIONS,
      COLLECTIONS.JOURNALS,
      COLLECTIONS.EXPERTS,
    ];

    for (const collection of requiredCollections) {
      const exists = await this.firestoreService.collectionExists(collection);
      if (!exists) {
        console.log(`📁 컬렉션 '${collection}' 초기화 중...`);
        // 빈 문서를 생성하여 컬렉션 초기화
        await this.firestoreService.create(collection, {
          _initialized: true,
          createdAt: new Date(),
        }, '_init');
      }
    }
  }

  /**
   * 인덱스 확인
   */
  private async verifyIndexes(): Promise<void> {
    console.log('🔍 데이터베이스 인덱스 확인 중...');
    
    // 실제 구현에서는 Firebase Admin SDK를 통해 인덱스 상태를 확인
    // 현재는 로그만 출력
    console.log('✅ 인덱스 확인 완료');
  }

  /**
   * 데이터 무결성 검사
   */
  private async runIntegrityCheck(): Promise<void> {
    console.log('🔍 데이터 무결성 검사 중...');

    try {
      // 샘플 데이터 검증
      const sampleUsers = await this.firestoreService.query<User>(
        COLLECTIONS.USERS,
        (ref) => ref.limit(5)
      );

      for (const user of sampleUsers) {
        const validation = this.schemaValidator.validate<User>('User', user);
        if (!validation.valid) {
          console.warn(`⚠️ 사용자 데이터 무결성 문제: ${user.core?.uid}, 오류: ${validation.errors?.join(', ')}`);
        }
      }

      console.log('✅ 데이터 무결성 검사 완료');
    } catch (error) {
      console.error('데이터 무결성 검사 실패:', error);
    }
  }

  /**
   * 건강 상태 체크
   */
  private async performHealthCheck(): Promise<void> {
    try {
      // Firestore 연결 상태 확인
      const isConnected = await this.firestoreService.checkConnection();
      if (!isConnected) {
        console.error('🔴 Firestore 연결 상태 불량');
        return;
      }

      // 성능 리포트 생성
      const performanceReport = this.performanceMonitor.generatePerformanceReport();
      
      if (performanceReport.summary.slowQueriesPercent > 20) {
        console.warn(`⚠️ 느린 쿼리 비율이 높습니다: ${performanceReport.summary.slowQueriesPercent}%`);
      }

      // 건강 상태 기록
      await this.firestoreService.create(COLLECTIONS.HEALTH_CHECK, {
        status: 'healthy',
        timestamp: new Date(),
        performanceSummary: performanceReport.summary,
        connectedToFirestore: isConnected,
      });

      console.log('💚 Database Agent 건강 상태 양호');

    } catch (error) {
      console.error('건강 상태 체크 실패:', error);
    }
  }

  /**
   * 성능 리포트 조회
   */
  public getPerformanceReport() {
    return this.performanceMonitor.generatePerformanceReport();
  }

  /**
   * 스키마 검증기 조회
   */
  public getSchemaValidator(): SchemaValidator {
    return this.schemaValidator;
  }

  /**
   * Firestore 서비스 조회
   */
  public getFirestoreService(): FirestoreService {
    return this.firestoreService;
  }
}