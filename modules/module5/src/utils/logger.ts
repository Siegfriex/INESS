/**
 * Module5 AI Integration Agent 로거
 */

import winston from 'winston';
import path from 'path';

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// 콘솔 포맷 (개발용)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [Module5] ${level}: ${message} ${metaStr}`;
  })
);

// 로거 생성
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'Module5-AI-Integration' },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'module5-error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 일반 로그 파일
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'module5-combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 콘솔 출력
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    })
  ]
});

// AI 전용 로거 인스턴스
export const aiLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'Module5-AI-Integration',
    category: 'AI-Operations'
  },
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'module5-ai-operations.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    })
  ]
});

// 성능 전용 로거
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'Module5-AI-Integration',
    category: 'Performance'
  },
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'module5-performance.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// 로그 디렉토리 생성
import fs from 'fs';
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export default logger;