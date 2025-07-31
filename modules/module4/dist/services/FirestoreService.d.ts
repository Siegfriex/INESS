/**
 * Firestore Service
 * Firebase Firestore 연결 및 기본 CRUD 작업
 */
import { Firestore, CollectionReference, DocumentReference, Query, WriteResult, Transaction, WriteBatch } from 'firebase-admin/firestore';
import { FirestoreConfig } from '../types';
export declare class FirestoreService {
    private app;
    private db;
    private isInitialized;
    constructor(config?: FirestoreConfig);
    /**
     * Firebase 초기화
     */
    private initialize;
    /**
     * Firestore 인스턴스 반환
     */
    getFirestore(): Firestore;
    /**
     * 컬렉션 참조 가져오기
     */
    collection(path: string): CollectionReference;
    /**
     * 문서 참조 가져오기
     */
    doc(path: string): DocumentReference;
    /**
     * 문서 생성
     */
    create<T extends Record<string, any>>(collectionPath: string, data: T, id?: string): Promise<string>;
    /**
     * 문서 읽기
     */
    read<T = any>(collectionPath: string, id: string): Promise<T | null>;
    /**
     * 문서 업데이트
     */
    update<T extends Record<string, any>>(collectionPath: string, id: string, data: Partial<T>): Promise<void>;
    /**
     * 문서 삭제
     */
    delete(collectionPath: string, id: string): Promise<void>;
    /**
     * 컬렉션 쿼리
     */
    query<T = any>(collectionPath: string, queryFn?: (ref: CollectionReference) => Query): Promise<T[]>;
    /**
     * 트랜잭션 실행
     */
    runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
    /**
     * 배치 작업
     */
    createBatch(): WriteBatch;
    /**
     * 배치 실행
     */
    commitBatch(batch: WriteBatch): Promise<WriteResult[]>;
    /**
     * 컬렉션 존재 여부 확인
     */
    collectionExists(path: string): Promise<boolean>;
    /**
     * 문서 존재 여부 확인
     */
    documentExists(collectionPath: string, id: string): Promise<boolean>;
    /**
     * 페이지네이션 쿼리
     */
    queryWithPagination<T = any>(collectionPath: string, limit: number, lastDoc?: any, queryFn?: (ref: CollectionReference) => Query): Promise<{
        data: T[];
        hasMore: boolean;
        lastDoc?: any;
    }>;
    /**
     * 연결 상태 확인
     */
    checkConnection(): Promise<boolean>;
    /**
     * 데이터베이스 에러 생성
     */
    private createDatabaseError;
    /**
     * 서비스 종료
     */
    close(): Promise<void>;
}
