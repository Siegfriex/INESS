/**
 * Module4 Database Agent Types
 * 데이터베이스 관련 타입 정의
 */
export interface FirestoreConfig {
    projectId: string;
    apiKey?: string | undefined;
    authDomain?: string | undefined;
    databaseURL?: string | undefined;
    storageBucket?: string | undefined;
    messagingSenderId?: string | undefined;
    appId?: string | undefined;
}
export interface DatabaseSchema {
    collections: CollectionSchema[];
    indexes: IndexSchema[];
    securityRules: SecurityRule[];
}
export interface CollectionSchema {
    name: string;
    fields: FieldSchema[];
    subcollections?: CollectionSchema[];
    validation: ValidationRule[];
}
export interface FieldSchema {
    name: string;
    type: FieldType;
    required: boolean;
    unique?: boolean;
    index?: boolean;
    validation?: ValidationRule[];
}
export type FieldType = 'string' | 'number' | 'boolean' | 'timestamp' | 'geopoint' | 'reference' | 'array' | 'map';
export interface ValidationRule {
    type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'range' | 'custom';
    value?: any;
    message: string;
}
export interface IndexSchema {
    collection: string;
    fields: IndexField[];
    queryScope: 'collection' | 'collection-group';
}
export interface IndexField {
    fieldPath: string;
    order: 'ascending' | 'descending' | 'array-contains';
}
export interface SecurityRule {
    path: string;
    allow: ('read' | 'write' | 'create' | 'update' | 'delete')[];
    condition: string;
}
export interface PerformanceMetrics {
    queryTime: number;
    readCount: number;
    writeCount: number;
    timestamp: Date;
    collection: string;
    operation: string;
}
export interface QueryAnalysis {
    query: string;
    executionTime: number;
    documentsRead: number;
    indexUsed: boolean;
    suggestions: string[];
}
export interface DatabaseError {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
}
export interface Migration {
    id: string;
    version: string;
    description: string;
    up: () => Promise<void>;
    down: () => Promise<void>;
    createdAt: Date;
}
export interface MigrationStatus {
    id: string;
    executed: boolean;
    executedAt?: Date;
    error?: string;
}
