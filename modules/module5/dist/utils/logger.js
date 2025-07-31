"use strict";
/**
 * Module5 AI Integration Agent 로거
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceLogger = exports.aiLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// 로그 포맷 정의
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.prettyPrint());
// 콘솔 포맷 (개발용)
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
    format: 'HH:mm:ss'
}), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [Module5] ${level}: ${message} ${metaStr}`;
}));
// 로거 생성
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'Module5-AI-Integration' },
    transports: [
        // 에러 로그 파일
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'module5-error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
        // 일반 로그 파일
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'module5-combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
        }),
        // 콘솔 출력
        new winston_1.default.transports.Console({
            format: consoleFormat,
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
        })
    ]
});
// AI 전용 로거 인스턴스
exports.aiLogger = winston_1.default.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: {
        service: 'Module5-AI-Integration',
        category: 'AI-Operations'
    },
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'module5-ai-operations.log'),
            maxsize: 10485760,
            maxFiles: 10,
        }),
        new winston_1.default.transports.Console({
            format: consoleFormat,
            level: 'debug'
        })
    ]
});
// 성능 전용 로거
exports.performanceLogger = winston_1.default.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: {
        service: 'Module5-AI-Integration',
        category: 'Performance'
    },
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'module5-performance.log'),
            maxsize: 5242880,
            maxFiles: 5,
        })
    ]
});
// 로그 디렉토리 생성
const fs_1 = __importDefault(require("fs"));
const logDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map