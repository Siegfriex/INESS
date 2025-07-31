import { Request } from 'express';

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  service: string;
  module: string;
  data?: any;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

class Logger {
  private serviceName = 'Module3-Backend';
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(level: string, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      module: 'API',
      ...(data && { data }),
    };
  }

  private output(logEntry: LogEntry): void {
    if (this.isDevelopment) {
      // 개발 환경에서는 컬러 출력
      const colors = {
        error: '\x1b[31m',
        warn: '\x1b[33m',
        info: '\x1b[36m',
        debug: '\x1b[37m',
        reset: '\x1b[0m',
      };

      const color = colors[logEntry.level as keyof typeof colors] || colors.reset;
      console.log(
        `${color}[${logEntry.timestamp}] ${logEntry.level.toUpperCase()} - ${logEntry.message}${colors.reset}`,
        logEntry.data ? '\n' + JSON.stringify(logEntry.data, null, 2) : ''
      );
    } else {
      // 프로덕션 환경에서는 구조적 JSON 로그
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, data?: any): void {
    this.output(this.formatLog('info', message, data));
  }

  warn(message: string, data?: any): void {
    this.output(this.formatLog('warn', message, data));
  }

  error(message: string, data?: any): void {
    this.output(this.formatLog('error', message, data));
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      this.output(this.formatLog('debug', message, data));
    }
  }

  // API 요청 로그용 특별 메서드
  request(req: Request, message: string, data?: any): void {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'] || 'unknown',
      userId: (req as any).user?.uid || 'anonymous',
      ...data,
    };

    this.info(message, logData);
  }

  // 성능 측정 로그
  performance(message: string, duration: number, data?: any): void {
    this.info(`⚡ ${message}`, {
      duration_ms: duration,
      performance: true,
      ...data,
    });
  }

  // 보안 관련 로그
  security(message: string, req: Request, data?: any): void {
    const securityData = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      security_event: true,
      ...data,
    };

    this.warn(`🛡️ SECURITY: ${message}`, securityData);
  }

  // 비즈니스 로직 로그
  business(message: string, data?: any): void {
    this.info(`📊 BUSINESS: ${message}`, {
      business_event: true,
      ...data,
    });
  }

  // 시스템 상태 로그
  system(message: string, data?: any): void {
    this.info(`⚙️ SYSTEM: ${message}`, {
      system_event: true,
      ...data,
    });
  }
}

export const logger = new Logger();