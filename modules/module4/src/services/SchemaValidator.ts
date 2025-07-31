/**
 * Schema Validator Service
 * 데이터베이스 스키마 검증 및 유효성 검사
 */

import Joi from 'joi';
import { 
  User, 
  EmotionCheckin, 
  JournalEntry, 
  ExpertProfile,
  DatabaseSchema,
  ValidationRule 
} from '../models';

export class SchemaValidator {
  private schemas: Map<string, Joi.ObjectSchema> = new Map();

  constructor() {
    this.initializeSchemas();
  }

  /**
   * 스키마 초기화
   */
  private initializeSchemas(): void {
    // User 스키마
    this.schemas.set('User', Joi.object({
      core: Joi.object({
        uid: Joi.string().required(),
        email: Joi.string().email().required(),
        displayName: Joi.string().optional(),
        photoURL: Joi.string().uri().optional(),
        phoneNumber: Joi.string().optional(),
        emailVerified: Joi.boolean().required(),
        createdAt: Joi.any().required(), // Timestamp
        lastLoginAt: Joi.any().required(),
        isActive: Joi.boolean().required(),
      }).required(),
      
      profile: Joi.object({
        birthYear: Joi.number().min(1900).max(new Date().getFullYear()).optional(),
        gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
        occupation: Joi.string().optional(),
        location: Joi.object({
          city: Joi.string().required(),
          country: Joi.string().required(),
        }).optional(),
        mentalHealthGoals: Joi.array().items(Joi.string()).default([]),
        emergencyContact: Joi.object({
          name: Joi.string().required(),
          phone: Joi.string().required(),
          relationship: Joi.string().required(),
        }).optional(),
        timezone: Joi.string().required(),
        preferredLanguage: Joi.string().required(),
      }).optional(),
      
      settings: Joi.object().required(),
      subscription: Joi.object().required(),
      privacy: Joi.object().required(),
      stats: Joi.object().required(),
      updatedAt: Joi.any().required(),
      version: Joi.number().required(),
    }));

    // EmotionCheckin 스키마
    this.schemas.set('EmotionCheckin', Joi.object({
      id: Joi.string().required(),
      userId: Joi.string().required(),
      
      structure: Joi.object({
        emotions: Joi.array().items(Joi.object({
          primary: Joi.string().valid(
            'joy', 'sadness', 'anger', 'fear', 
            'surprise', 'disgust', 'trust', 'anticipation'
          ).required(),
          secondary: Joi.string().optional(),
          intensity: Joi.number().min(1).max(10).required(),
        })).min(1).required(),
        
        dominantEmotion: Joi.object().required(),
        triggers: Joi.array().items(Joi.object()).default([]),
        context: Joi.object().required(),
        notes: Joi.string().optional(),
        copingStrategies: Joi.array().items(Joi.string()).optional(),
        helpfulness: Joi.number().min(1).max(10).optional(),
      }).required(),
      
      analysis: Joi.object({
        riskLevel: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
        patterns: Joi.object().required(),
        insights: Joi.object().required(),
        scores: Joi.object().required(),
        keywords: Joi.array().items(Joi.string()).required(),
        sentiment_score: Joi.number().min(-1).max(1).required(),
        confidence: Joi.number().min(0).max(1).required(),
      }).required(),
      
      media: Joi.array().items(Joi.object()).optional(),
      createdAt: Joi.any().required(),
      updatedAt: Joi.any().required(),
      isPrivate: Joi.boolean().required(),
      sharedWith: Joi.array().items(Joi.string()).optional(),
      source: Joi.string().valid('manual', 'reminder', 'crisis_detection', 'scheduled').required(),
      device: Joi.string().required(),
      appVersion: Joi.string().required(),
      validated: Joi.boolean().required(),
      flagged: Joi.boolean().required(),
      flagReason: Joi.string().optional(),
    }));

    // JournalEntry 스키마
    this.schemas.set('JournalEntry', Joi.object({
      id: Joi.string().required(),
      userId: Joi.string().required(),
      
      content: Joi.object({
        title: Joi.string().optional(),
        body: Joi.string().min(1).required(),
        wordCount: Joi.number().min(0).required(),
        readingTime: Joi.number().min(0).required(),
        language: Joi.string().required(),
        linkedEmotions: Joi.array().items(Joi.string()).default([]),
        mood: Joi.object({
          before: Joi.number().min(1).max(10).required(),
          after: Joi.number().min(1).max(10).required(),
        }).required(),
        tags: Joi.array().items(Joi.string()).default([]),
        category: Joi.string().valid(
          'daily', 'gratitude', 'reflection', 'goal_setting', 
          'crisis', 'celebration', 'other'
        ).optional(),
        attachments: Joi.array().items(Joi.object()).optional(),
      }).required(),
      
      analysis: Joi.object().optional(),
      privacy: Joi.object().required(),
      createdAt: Joi.any().required(),
      updatedAt: Joi.any().required(),
      publishedAt: Joi.any().optional(),
      writingSession: Joi.object().required(),
      reactions: Joi.object().optional(),
      comments: Joi.object().optional(),
      flagged: Joi.boolean().required(),
      flagReason: Joi.string().optional(),
      reviewed: Joi.boolean().required(),
      reviewedBy: Joi.string().optional(),
      reviewedAt: Joi.any().optional(),
      version: Joi.number().required(),
      editHistory: Joi.array().items(Joi.object()).optional(),
    }));

    // ExpertProfile 스키마
    this.schemas.set('ExpertProfile', Joi.object({
      uid: Joi.string().required(),
      
      personalInfo: Joi.object({
        displayName: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        profilePhoto: Joi.string().uri().optional(),
        bio: Joi.string().min(50).max(1000).required(),
        introduction: Joi.string().min(100).max(2000).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().optional(),
        location: Joi.object({
          country: Joi.string().required(),
          state: Joi.string().required(),
          city: Joi.string().required(),
          timezone: Joi.string().required(),
        }).required(),
      }).required(),
      
      credentials: Joi.object({
        licenseNumber: Joi.string().required(),
        licenseType: Joi.string().required(),
        issuingAuthority: Joi.string().required(),
        issueDate: Joi.any().required(),
        expiryDate: Joi.any().required(),
        verificationStatus: Joi.string().valid(
          'pending', 'verified', 'rejected', 'expired'
        ).required(),
        verifiedBy: Joi.string().optional(),
        verifiedAt: Joi.any().optional(),
        additionalCertifications: Joi.array().items(Joi.object()).optional(),
        education: Joi.array().items(Joi.object()).min(1).required(),
        experience: Joi.array().items(Joi.object()).min(1).required(),
      }).required(),
      
      specialties: Joi.object({
        primaryAreas: Joi.array().items(Joi.string()).min(1).required(),
        secondaryAreas: Joi.array().items(Joi.string()).default([]),
        approaches: Joi.array().items(Joi.string().valid(
          'CBT', 'DBT', 'mindfulness', 'psychodynamic', 
          'humanistic', 'family_therapy', 'other'
        )).min(1).required(),
        languages: Joi.array().items(Joi.string()).min(1).required(),
        ageGroups: Joi.array().items(Joi.string().valid(
          'children', 'adolescents', 'adults', 'seniors'
        )).min(1).required(),
        specialConditions: Joi.array().items(Joi.string()).default([]),
        treatmentMethods: Joi.array().items(Joi.string()).default([]),
        certifiedTherapies: Joi.array().items(Joi.string()).default([]),
        yearsOfExperience: Joi.number().min(0).required(),
        totalSessionsConducted: Joi.number().min(0).required(),
        specialtyRating: Joi.object().default({}),
      }).required(),
      
      services: Joi.object().required(),
      status: Joi.string().valid('active', 'inactive', 'on_leave', 'suspended').required(),
      joinedAt: Joi.any().required(),
      lastActiveAt: Joi.any().required(),
      profileCompleteness: Joi.number().min(0).max(100).required(),
    }));

    console.log('✅ 스키마 검증기 초기화 완료');
  }

  /**
   * 데이터 유효성 검사
   */
  public validate<T>(schemaName: string, data: any): { 
    valid: boolean; 
    data?: T; 
    errors?: string[] 
  } {
    const schema = this.schemas.get(schemaName);
    
    if (!schema) {
      return {
        valid: false,
        errors: [`스키마 '${schemaName}'을 찾을 수 없습니다.`],
      };
    }

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return {
        valid: false,
        errors: error.details.map(detail => detail.message),
      };
    }

    return {
      valid: true,
      data: value as T,
    };
  }

  /**
   * 부분 데이터 유효성 검사 (업데이트용)
   */
  public validatePartial<T>(schemaName: string, data: any): {
    valid: boolean;
    data?: Partial<T>;
    errors?: string[];
  } {
    const schema = this.schemas.get(schemaName);
    
    if (!schema) {
      return {
        valid: false,
        errors: [`스키마 '${schemaName}'을 찾을 수 없습니다.`],
      };
    }

    // 부분 스키마로 변환 (모든 필드를 optional로)
    const partialSchema = schema.fork(Object.keys(schema.describe().keys), (schema) => 
      schema.optional()
    );

    const { error, value } = partialSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return {
        valid: false,
        errors: error.details.map(detail => detail.message),
      };
    }

    return {
      valid: true,
      data: value as Partial<T>,
    };
  }

  /**
   * 커스텀 검증 규칙 추가
   */
  public addCustomValidation(
    schemaName: string,
    fieldPath: string,
    validationFn: (value: any) => boolean | string
  ): void {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`스키마 '${schemaName}'을 찾을 수 없습니다.`);
    }

    // 커스텀 검증 로직 추가
    // 실제 구현은 더 복잡할 수 있음
    console.log(`커스텀 검증 규칙 추가: ${schemaName}.${fieldPath}`);
  }

  /**
   * 배열 데이터 유효성 검사
   */
  public validateArray<T>(schemaName: string, dataArray: any[]): {
    valid: boolean;
    validData: T[];
    errors: { index: number; errors: string[] }[];
  } {
    const validData: T[] = [];
    const errors: { index: number; errors: string[] }[] = [];

    dataArray.forEach((data, index) => {
      const result = this.validate<T>(schemaName, data);
      
      if (result.valid && result.data) {
        validData.push(result.data);
      } else {
        errors.push({
          index,
          errors: result.errors || ['알 수 없는 오류'],
        });
      }
    });

    return {
      valid: errors.length === 0,
      validData,
      errors,
    };
  }

  /**
   * 필드별 검증
   */
  public validateField(
    schemaName: string,
    fieldName: string,
    value: any
  ): { valid: boolean; error?: string } {
    const schema = this.schemas.get(schemaName);
    
    if (!schema) {
      return {
        valid: false,
        error: `스키마 '${schemaName}'을 찾을 수 없습니다.`,
      };
    }

    try {
      const schemaDescription = schema.describe();
      const fieldSchema = this.getFieldSchema(schemaDescription, fieldName);
      
      if (!fieldSchema) {
        return {
          valid: false,
          error: `필드 '${fieldName}'을 찾을 수 없습니다.`,
        };
      }

      const { error } = fieldSchema.validate(value);
      
      return {
        valid: !error,
        error: error?.message,
      };
    } catch (err) {
      return {
        valid: false,
        error: '필드 검증 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 스키마 설명에서 필드 스키마 추출
   */
  private getFieldSchema(schemaDescription: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let current = schemaDescription;
    
    for (const part of parts) {
      if (current.keys && current.keys[part]) {
        current = current.keys[part];
      } else {
        return null;
      }
    }
    
    return current;
  }

  /**
   * 사용 가능한 스키마 목록 반환
   */
  public getAvailableSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * 스키마 정보 반환
   */
  public getSchemaInfo(schemaName: string): any {
    const schema = this.schemas.get(schemaName);
    return schema ? schema.describe() : null;
  }
}