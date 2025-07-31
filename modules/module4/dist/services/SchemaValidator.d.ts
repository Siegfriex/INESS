/**
 * Schema Validator Service
 * 데이터베이스 스키마 검증 및 유효성 검사
 */
export declare class SchemaValidator {
    private schemas;
    constructor();
    /**
     * 스키마 초기화
     */
    private initializeSchemas;
    /**
     * 데이터 유효성 검사
     */
    validate<T>(schemaName: string, data: any): {
        valid: boolean;
        data?: T;
        errors?: string[];
    };
    /**
     * 부분 데이터 유효성 검사 (업데이트용)
     */
    validatePartial<T>(schemaName: string, data: any): {
        valid: boolean;
        data?: Partial<T>;
        errors?: string[];
    };
    /**
     * 커스텀 검증 규칙 추가
     */
    addCustomValidation(schemaName: string, fieldPath: string, validationFn: (value: any) => boolean | string): void;
    /**
     * 배열 데이터 유효성 검사
     */
    validateArray<T>(schemaName: string, dataArray: any[]): {
        valid: boolean;
        validData: T[];
        errors: {
            index: number;
            errors: string[];
        }[];
    };
    /**
     * 필드별 검증
     */
    validateField(schemaName: string, fieldName: string, value: any): {
        valid: boolean;
        error?: string;
    };
    /**
     * 스키마 설명에서 필드 스키마 추출
     */
    private getFieldSchema;
    /**
     * 사용 가능한 스키마 목록 반환
     */
    getAvailableSchemas(): string[];
    /**
     * 스키마 정보 반환
     */
    getSchemaInfo(schemaName: string): any;
}
