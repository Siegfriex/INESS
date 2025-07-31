/**
 * Firestore Service
 * Firebase Firestore 연결 및 기본 CRUD 작업
 */

import { 
  initializeApp, 
  getApps, 
  App,
  cert,
  ServiceAccount 
} from 'firebase-admin/app';
import { 
  getFirestore, 
  Firestore,
  CollectionReference,
  DocumentReference,
  Query,
  QuerySnapshot,
  DocumentSnapshot,
  WriteResult,
  Transaction,
  WriteBatch,
  FieldValue
} from 'firebase-admin/firestore';

import { FirestoreConfig, DatabaseError } from '../types';

export class FirestoreService {
  private app!: App;
  private db!: Firestore;
  private isInitialized: boolean = false;

  constructor(config?: FirestoreConfig) {
    this.initialize(config);
  }

  /**
   * Firebase 초기화
   */
  private initialize(config?: FirestoreConfig): void {
    try {
      // 이미 초기화된 앱이 있는지 확인
      const existingApps = getApps();
      
      if (existingApps.length > 0 && existingApps[0]) {
        this.app = existingApps[0];
      } else {
        // 환경변수에서 설정 읽기
        const serviceAccount: ServiceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID || config?.projectId || 'maumlog-v2',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        };

        this.app = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.projectId || 'maumlog-v2',
        });
      }

      this.db = getFirestore(this.app);
      this.isInitialized = true;
      
      console.log('✅ Firestore 연결 성공');
    } catch (error) {
      console.error('❌ Firestore 초기화 실패:', error);
      throw this.createDatabaseError('INIT_FAILED', 'Firestore 초기화에 실패했습니다.', error);
    }
  }

  /**
   * Firestore 인스턴스 반환
   */
  public getFirestore(): Firestore {
    if (!this.isInitialized) {
      throw this.createDatabaseError('NOT_INITIALIZED', 'Firestore가 초기화되지 않았습니다.');
    }
    return this.db;
  }

  /**
   * 컬렉션 참조 가져오기
   */
  public collection(path: string): CollectionReference {
    return this.db.collection(path);
  }

  /**
   * 문서 참조 가져오기
   */
  public doc(path: string): DocumentReference {
    return this.db.doc(path);
  }

  /**
   * 문서 생성
   */
  public async create<T extends Record<string, any>>(
    collectionPath: string,
    data: T,
    id?: string
  ): Promise<string> {
    try {
      const timestamp = FieldValue.serverTimestamp();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (id) {
        await this.db.collection(collectionPath).doc(id).set(docData);
        return id;
      } else {
        const docRef = await this.db.collection(collectionPath).add(docData);
        return docRef.id;
      }
    } catch (error) {
      throw this.createDatabaseError('CREATE_FAILED', '문서 생성에 실패했습니다.', error);
    }
  }

  /**
   * 문서 읽기
   */
  public async read<T = any>(
    collectionPath: string,
    id: string
  ): Promise<T | null> {
    try {
      const doc = await this.db.collection(collectionPath).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as T;
    } catch (error) {
      throw this.createDatabaseError('READ_FAILED', '문서 읽기에 실패했습니다.', error);
    }
  }

  /**
   * 문서 업데이트
   */
  public async update<T extends Record<string, any>>(
    collectionPath: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const updateData = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await this.db.collection(collectionPath).doc(id).update(updateData);
    } catch (error) {
      throw this.createDatabaseError('UPDATE_FAILED', '문서 업데이트에 실패했습니다.', error);
    }
  }

  /**
   * 문서 삭제
   */
  public async delete(
    collectionPath: string,
    id: string
  ): Promise<void> {
    try {
      await this.db.collection(collectionPath).doc(id).delete();
    } catch (error) {
      throw this.createDatabaseError('DELETE_FAILED', '문서 삭제에 실패했습니다.', error);
    }
  }

  /**
   * 컬렉션 쿼리
   */
  public async query<T = any>(
    collectionPath: string,
    queryFn?: (ref: CollectionReference) => Query
  ): Promise<T[]> {
    try {
      let query: Query = this.db.collection(collectionPath);
      
      if (queryFn) {
        query = queryFn(this.db.collection(collectionPath));
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      throw this.createDatabaseError('QUERY_FAILED', '쿼리 실행에 실패했습니다.', error);
    }
  }

  /**
   * 트랜잭션 실행
   */
  public async runTransaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    try {
      return await this.db.runTransaction(updateFunction);
    } catch (error) {
      throw this.createDatabaseError('TRANSACTION_FAILED', '트랜잭션 실행에 실패했습니다.', error);
    }
  }

  /**
   * 배치 작업
   */
  public createBatch(): WriteBatch {
    return this.db.batch();
  }

  /**
   * 배치 실행
   */
  public async commitBatch(batch: WriteBatch): Promise<WriteResult[]> {
    try {
      return await batch.commit();
    } catch (error) {
      throw this.createDatabaseError('BATCH_FAILED', '배치 작업에 실패했습니다.', error);
    }
  }

  /**
   * 컬렉션 존재 여부 확인
   */
  public async collectionExists(path: string): Promise<boolean> {
    try {
      const snapshot = await this.db.collection(path).limit(1).get();
      return !snapshot.empty;
    } catch (error) {
      return false;
    }
  }

  /**
   * 문서 존재 여부 확인
   */
  public async documentExists(collectionPath: string, id: string): Promise<boolean> {
    try {
      const doc = await this.db.collection(collectionPath).doc(id).get();
      return doc.exists;
    } catch (error) {
      return false;
    }
  }

  /**
   * 페이지네이션 쿼리
   */
  public async queryWithPagination<T = any>(
    collectionPath: string,
    limit: number,
    lastDoc?: any,
    queryFn?: (ref: CollectionReference) => Query
  ): Promise<{ data: T[]; hasMore: boolean; lastDoc?: any }> {
    try {
      let query: Query = this.db.collection(collectionPath);
      
      if (queryFn) {
        query = queryFn(this.db.collection(collectionPath));
      }

      query = query.limit(limit + 1); // +1로 hasMore 확인

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();
      const docs = snapshot.docs;
      
      const hasMore = docs.length > limit;
      const data = docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      return {
        data,
        hasMore,
        lastDoc: hasMore ? docs[limit - 1] : undefined,
      };
    } catch (error) {
      throw this.createDatabaseError('PAGINATION_FAILED', '페이지네이션 쿼리에 실패했습니다.', error);
    }
  }

  /**
   * 연결 상태 확인
   */
  public async checkConnection(): Promise<boolean> {
    try {
      // 간단한 읽기 작업으로 연결 확인
      await this.db.collection('_health_check').limit(1).get();
      return true;
    } catch (error) {
      console.error('Firestore 연결 확인 실패:', error);
      return false;
    }
  }

  /**
   * 데이터베이스 에러 생성
   */
  private createDatabaseError(code: string, message: string, details?: any): DatabaseError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
    };
  }

  /**
   * 서비스 종료
   */
  public async close(): Promise<void> {
    try {
      // Firebase Admin App 종료는 다른 방식으로 처리
      this.isInitialized = false;
      console.log('🔒 Firestore 연결 종료');
    } catch (error) {
      console.error('Firestore 종료 실패:', error);
    }
  }
}