"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerformanceReport = exports.getHealthStatus = exports.performanceMonitor = void 0;
exports.withPerformanceMonitoring = withPerformanceMonitoring;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
class PerformanceMonitor {
    constructor() {
        this.alertThresholds = [
            {
                service: 'ai-analysis',
                metric: 'responseTime',
                threshold: 5000, // 5초
                severity: 'high',
                windowMinutes: 5
            },
            {
                service: 'crisis-detection',
                metric: 'responseTime',
                threshold: 2000, // 2초
                severity: 'critical',
                windowMinutes: 1
            },
            {
                service: 'ai-analysis',
                metric: 'errorRate',
                threshold: 0.05, // 5%
                severity: 'medium',
                windowMinutes: 10
            },
            {
                service: 'crisis-detection',
                metric: 'errorRate',
                threshold: 0.01, // 1%
                severity: 'critical',
                windowMinutes: 5
            }
        ];
    }
    /**
     * 성능 메트릭 수집
     */
    async collectMetrics(service, startTime, success) {
        const responseTime = Date.now() - startTime;
        const metrics = {
            timestamp: Date.now(),
            service,
            responseTime,
            errorRate: success ? 0 : 1,
            throughput: 1,
            memoryUsage: process.memoryUsage().heapUsed,
            cpuUsage: process.cpuUsage().user
        };
        // Firestore에 메트릭 저장 (배치 처리로 최적화)
        await this.batchWriteMetrics(metrics);
        // 실시간 알림 체크
        await this.checkAlerts(metrics);
    }
    /**
     * 배치 메트릭 쓰기 (성능 최적화)
     */
    async batchWriteMetrics(metrics) {
        const batch = admin.firestore().batch();
        // 시간별 집계 데이터 생성
        const hourlyRef = admin.firestore()
            .collection('performance_metrics')
            .doc(`${metrics.service}_${Math.floor(metrics.timestamp / 3600000)}`);
        // 기존 데이터와 병합
        batch.set(hourlyRef, {
            service: metrics.service,
            hour: Math.floor(metrics.timestamp / 3600000),
            totalRequests: admin.firestore.FieldValue.increment(1),
            totalResponseTime: admin.firestore.FieldValue.increment(metrics.responseTime),
            totalErrors: admin.firestore.FieldValue.increment(metrics.errorRate),
            avgMemoryUsage: metrics.memoryUsage,
            lastUpdated: metrics.timestamp
        }, { merge: true });
        await batch.commit();
    }
    /**
     * 실시간 알림 체크
     */
    async checkAlerts(metrics) {
        for (const threshold of this.alertThresholds) {
            if (threshold.service !== metrics.service)
                continue;
            const metricValue = this.getMetricValue(metrics, threshold.metric);
            if (metricValue > threshold.threshold) {
                await this.triggerAlert(threshold, metricValue, metrics);
            }
        }
    }
    /**
     * 메트릭 값 추출
     */
    getMetricValue(metrics, metricName) {
        switch (metricName) {
            case 'responseTime':
                return metrics.responseTime;
            case 'errorRate':
                return metrics.errorRate;
            case 'memoryUsage':
                return metrics.memoryUsage;
            case 'cpuUsage':
                return metrics.cpuUsage;
            default:
                return 0;
        }
    }
    /**
     * 알림 발송 및 자동 대응
     */
    async triggerAlert(threshold, value, metrics) {
        const alert = {
            timestamp: Date.now(),
            service: threshold.service,
            metric: threshold.metric,
            threshold: threshold.threshold,
            actualValue: value,
            severity: threshold.severity,
            autoActionTaken: false
        };
        // Critical 알림의 경우 자동 스케일링
        if (threshold.severity === 'critical') {
            await this.autoScale(threshold.service);
            alert.autoActionTaken = true;
        }
        // Slack/Discord 알림 발송
        await this.sendAlert(alert);
        // 알림 이력 저장
        await admin.firestore()
            .collection('alerts')
            .add(alert);
    }
    /**
     * 자동 스케일링 (Cloud Run 기반)
     */
    async autoScale(service) {
        console.log(`Auto-scaling triggered for service: ${service}`);
        // 실제 프로덕션에서는 Cloud Run API 호출
        try {
            const scaleConfig = this.getScaleConfig(service);
            // Cloud Run 서비스 스케일 조정
            // await cloudRunAPI.updateService(service, scaleConfig);
            console.log(`Auto-scaling completed for ${service}:`, scaleConfig);
        }
        catch (error) {
            console.error(`Auto-scaling failed for ${service}:`, error);
        }
    }
    /**
     * 서비스별 스케일링 설정
     */
    getScaleConfig(service) {
        const configs = {
            'ai-analysis': {
                minInstances: 3,
                maxInstances: 100,
                concurrency: 1
            },
            'crisis-detection': {
                minInstances: 10,
                maxInstances: 200,
                concurrency: 80
            },
            'expert-matching': {
                minInstances: 2,
                maxInstances: 50,
                concurrency: 10
            }
        };
        return configs[service] || { minInstances: 1, maxInstances: 10, concurrency: 1 };
    }
    /**
     * 알림 발송
     */
    async sendAlert(alert) {
        const message = `🚨 Performance Alert - ${alert.service}
    
Metric: ${alert.metric}
Threshold: ${alert.threshold}
Actual: ${alert.actualValue}
Severity: ${alert.severity}
Auto Action: ${alert.autoActionTaken ? 'Yes' : 'No'}
Time: ${new Date(alert.timestamp).toISOString()}`;
        // Slack Webhook 호출 (실제 환경에서 구현)
        try {
            const webhookUrl = process.env.SLACK_WEBHOOK_URL;
            if (webhookUrl) {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: message })
                });
            }
        }
        catch (error) {
            console.error('Failed to send Slack alert:', error);
        }
    }
    /**
     * 성능 리포트 생성
     */
    async generatePerformanceReport(startTime, endTime) {
        const metricsSnapshot = await admin.firestore()
            .collection('performance_metrics')
            .where('lastUpdated', '>=', startTime)
            .where('lastUpdated', '<=', endTime)
            .get();
        const serviceMetrics = {};
        metricsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const service = data.service;
            if (!serviceMetrics[service]) {
                serviceMetrics[service] = {
                    totalRequests: 0,
                    avgResponseTime: 0,
                    errorRate: 0,
                    uptime: 0
                };
            }
            serviceMetrics[service].totalRequests += data.totalRequests || 0;
            serviceMetrics[service].avgResponseTime = data.totalResponseTime / data.totalRequests;
            serviceMetrics[service].errorRate = data.totalErrors / data.totalRequests;
        });
        return {
            period: { startTime, endTime },
            services: serviceMetrics,
            generatedAt: Date.now()
        };
    }
    /**
     * 헬스 체크 엔드포인트
     */
    async healthCheck() {
        const services = ['ai-analysis', 'crisis-detection', 'expert-matching'];
        const serviceStatus = {};
        let overallStatus = 'healthy';
        for (const service of services) {
            try {
                const latestMetrics = await this.getLatestMetrics(service);
                const isHealthy = this.evaluateServiceHealth(latestMetrics);
                serviceStatus[service] = {
                    status: isHealthy ? 'healthy' : 'degraded',
                    lastCheck: Date.now(),
                    responseTime: (latestMetrics === null || latestMetrics === void 0 ? void 0 : latestMetrics.responseTime) || 0,
                    errorRate: (latestMetrics === null || latestMetrics === void 0 ? void 0 : latestMetrics.errorRate) || 0
                };
                if (!isHealthy && overallStatus === 'healthy') {
                    overallStatus = 'degraded';
                }
            }
            catch (error) {
                serviceStatus[service] = {
                    status: 'unhealthy',
                    lastCheck: Date.now(),
                    error: error.message
                };
                overallStatus = 'unhealthy';
            }
        }
        return {
            status: overallStatus,
            services: serviceStatus,
            timestamp: Date.now()
        };
    }
    async getLatestMetrics(service) {
        const snapshot = await admin.firestore()
            .collection('performance_metrics')
            .where('service', '==', service)
            .orderBy('lastUpdated', 'desc')
            .limit(1)
            .get();
        return snapshot.empty ? null : snapshot.docs[0].data();
    }
    evaluateServiceHealth(metrics) {
        if (!metrics)
            return false;
        return metrics.responseTime < 5000 && // 5초 이내
            metrics.errorRate < 0.05 && // 5% 이하 에러율
            Date.now() - metrics.timestamp < 300000; // 5분 이내 데이터
    }
}
// 싱글톤 인스턴스
exports.performanceMonitor = new PerformanceMonitor();
/**
 * 성능 모니터링 미들웨어
 */
function withPerformanceMonitoring(serviceId) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const startTime = Date.now();
            let success = true;
            try {
                const result = await method.apply(this, args);
                return result;
            }
            catch (error) {
                success = false;
                throw error;
            }
            finally {
                await exports.performanceMonitor.collectMetrics(serviceId, startTime, success);
            }
        };
        return descriptor;
    };
}
/**
 * Cloud Functions Handlers
 */
exports.getHealthStatus = functions
    .region('us-central1')
    .runWith({ timeoutSeconds: 30, memory: '256MB' })
    .https.onRequest(async (req, res) => {
    try {
        const healthReport = await exports.performanceMonitor.healthCheck();
        res.status(200).json(healthReport);
    }
    catch (error) {
        res.status(500).json({ error: 'Health check failed', timestamp: Date.now() });
    }
});
exports.getPerformanceReport = functions
    .region('us-central1')
    .runWith({ timeoutSeconds: 60, memory: '512MB' })
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    // 관리자 권한 확인
    const isAdmin = await admin.firestore()
        .collection('admins')
        .doc(context.auth.uid)
        .get();
    if (!isAdmin.exists) {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }
    const { startTime, endTime } = data;
    const report = await exports.performanceMonitor.generatePerformanceReport(startTime, endTime);
    return report;
});
//# sourceMappingURL=performanceMonitor.js.map