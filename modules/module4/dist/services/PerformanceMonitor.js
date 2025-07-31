/**
 * Performance Monitor Service
 * 데이터베이스 성능 모니터링 및 최적화 제안
 */
import { PERFORMANCE_THRESHOLDS, COLLECTIONS } from '../config/firebase';
import { FirestoreService } from './FirestoreService';
export class PerformanceMonitor {
    constructor(firestoreService) {
        this.metrics = new Map();
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.firestoreService = firestoreService || new FirestoreService();
    }
    /**
     * 모니터링 시작
     */
    async startMonitoring(intervalMs = 60000) {
        if (this.isMonitoring) {
            console.log('🔍 Performance Monitor 이미 실행 중입니다.');
            return;
        }
        this.isMonitoring = true;
        console.log('🔍 Performance Monitor 시작');
        // 주기적 성능 체크
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.collectSystemMetrics();
                await this.analyzePerformanceTrends();
                await this.checkThresholds();
            }
            catch (error) {
                console.error('성능 모니터링 중 오류:', error);
            }
        }, intervalMs);
        // 초기 메트릭 수집
        await this.collectSystemMetrics();
    }
    /**
     * 모니터링 중지
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isMonitoring = false;
        console.log('⏹️ Performance Monitor 중지');
    }
    /**
     * 쿼리 성능 측정
     */
    async measureQuery(operation, collection, queryFn) {
        const startTime = Date.now();
        const startReadCount = await this.getCurrentReadCount();
        try {
            const result = await queryFn();
            const endTime = Date.now();
            const endReadCount = await this.getCurrentReadCount();
            const metrics = {
                queryTime: endTime - startTime,
                readCount: endReadCount - startReadCount,
                writeCount: 0,
                timestamp: new Date(),
                collection,
                operation,
            };
            await this.recordMetrics(collection, metrics);
            // 성능 경고 확인
            if (metrics.queryTime > PERFORMANCE_THRESHOLDS.QUERY_TIME_WARNING) {
                console.warn(`⚠️ 느린 쿼리 감지: ${collection}.${operation} (${metrics.queryTime}ms)`);
            }
            return { result, metrics };
        }
        catch (error) {
            const endTime = Date.now();
            const metrics = {
                queryTime: endTime - startTime,
                readCount: 0,
                writeCount: 0,
                timestamp: new Date(),
                collection,
                operation: `${operation}_ERROR`,
            };
            await this.recordMetrics(collection, metrics);
            throw error;
        }
    }
    /**
     * 쓰기 성능 측정
     */
    async measureWrite(operation, collection, writeFn) {
        const startTime = Date.now();
        const startWriteCount = await this.getCurrentWriteCount();
        try {
            const result = await writeFn();
            const endTime = Date.now();
            const endWriteCount = await this.getCurrentWriteCount();
            const metrics = {
                queryTime: endTime - startTime,
                readCount: 0,
                writeCount: endWriteCount - startWriteCount,
                timestamp: new Date(),
                collection,
                operation,
            };
            await this.recordMetrics(collection, metrics);
            return { result, metrics };
        }
        catch (error) {
            const endTime = Date.now();
            const metrics = {
                queryTime: endTime - startTime,
                readCount: 0,
                writeCount: 0,
                timestamp: new Date(),
                collection,
                operation: `${operation}_ERROR`,
            };
            await this.recordMetrics(collection, metrics);
            throw error;
        }
    }
    /**
     * 쿼리 분석 및 최적화 제안
     */
    analyzeQuery(query, executionTime, documentsRead, indexUsed) {
        const suggestions = [];
        // 성능 분석
        if (executionTime > PERFORMANCE_THRESHOLDS.QUERY_TIME_WARNING) {
            suggestions.push('쿼리 실행 시간이 너무 깁니다. 인덱스 최적화를 고려하세요.');
        }
        if (documentsRead > PERFORMANCE_THRESHOLDS.READ_COUNT_WARNING) {
            suggestions.push('너무 많은 문서를 읽고 있습니다. 필터링을 강화하거나 페이지네이션을 적용하세요.');
        }
        if (!indexUsed) {
            suggestions.push('인덱스를 사용하지 않는 쿼리입니다. 적절한 인덱스를 생성하세요.');
        }
        // 쿼리 패턴 분석
        if (query.includes('array-contains') && query.includes('==')) {
            suggestions.push('배열 쿼리와 등식 쿼리를 함께 사용하면 성능이 저하될 수 있습니다.');
        }
        if (query.includes('orderBy') && !query.includes('limit')) {
            suggestions.push('정렬 쿼리에는 limit을 함께 사용하는 것이 좋습니다.');
        }
        return {
            query,
            executionTime,
            documentsRead,
            indexUsed,
            suggestions,
        };
    }
    /**
     * 시스템 메트릭 수집
     */
    async collectSystemMetrics() {
        try {
            // 각 컬렉션별 기본 통계 수집
            const collections = [
                COLLECTIONS.USERS,
                COLLECTIONS.EMOTIONS,
                COLLECTIONS.JOURNALS,
                COLLECTIONS.EXPERTS,
            ];
            for (const collection of collections) {
                await this.collectCollectionMetrics(collection);
            }
        }
        catch (error) {
            console.error('시스템 메트릭 수집 실패:', error);
        }
    }
    /**
     * 컬렉션별 메트릭 수집
     */
    async collectCollectionMetrics(collectionName) {
        const startTime = Date.now();
        try {
            // 컬렉션 문서 수 확인 (샘플링)
            const sampleQuery = () => this.firestoreService.query(collectionName, (ref) => ref.limit(1));
            const { result, metrics } = await this.measureQuery('health_check', collectionName, sampleQuery);
            // 컬렉션 존재 여부 및 접근 가능성 확인
            const exists = await this.firestoreService.collectionExists(collectionName);
            if (!exists) {
                console.warn(`⚠️ 컬렉션 '${collectionName}'이 존재하지 않거나 비어있습니다.`);
            }
        }
        catch (error) {
            console.error(`컬렉션 '${collectionName}' 메트릭 수집 실패:`, error);
        }
    }
    /**
     * 성능 트렌드 분석
     */
    async analyzePerformanceTrends() {
        for (const [collection, metricsList] of this.metrics) {
            if (metricsList.length < 5)
                continue; // 충분한 데이터가 없으면 스킵
            const recentMetrics = metricsList.slice(-10); // 최근 10개
            const avgQueryTime = recentMetrics.reduce((sum, m) => sum + m.queryTime, 0) / recentMetrics.length;
            const avgReadCount = recentMetrics.reduce((sum, m) => sum + m.readCount, 0) / recentMetrics.length;
            // 성능 저하 감지
            if (avgQueryTime > PERFORMANCE_THRESHOLDS.QUERY_TIME_WARNING) {
                console.warn(`📈 ${collection} 컬렉션의 평균 쿼리 시간이 증가했습니다: ${avgQueryTime.toFixed(2)}ms`);
                await this.generateOptimizationSuggestions(collection, recentMetrics);
            }
            if (avgReadCount > PERFORMANCE_THRESHOLDS.READ_COUNT_WARNING) {
                console.warn(`📊 ${collection} 컬렉션의 읽기 작업이 증가했습니다: ${avgReadCount.toFixed(2)}개 문서`);
            }
        }
    }
    /**
     * 최적화 제안 생성
     */
    async generateOptimizationSuggestions(collection, metrics) {
        const suggestions = [];
        // 쿼리 패턴 분석
        const operationCounts = metrics.reduce((acc, metric) => {
            acc[metric.operation] = (acc[metric.operation] || 0) + 1;
            return acc;
        }, {});
        const mostFrequentOp = Object.entries(operationCounts)
            .sort(([, a], [, b]) => b - a)[0];
        if (mostFrequentOp) {
            suggestions.push(`가장 빈번한 작업: ${mostFrequentOp[0]} (${mostFrequentOp[1]}회)`);
        }
        // 성능 개선 제안
        const highReadOps = metrics.filter(m => m.readCount > 50);
        if (highReadOps.length > 0) {
            suggestions.push('높은 읽기 작업이 감지되었습니다. 인덱스 최적화를 검토하세요.');
        }
        const slowQueries = metrics.filter(m => m.queryTime > 1000);
        if (slowQueries.length > 0) {
            suggestions.push('느린 쿼리가 감지되었습니다. 쿼리 구조를 검토하세요.');
        }
        if (suggestions.length > 0) {
            console.log(`💡 ${collection} 최적화 제안:`);
            suggestions.forEach(suggestion => console.log(`   - ${suggestion}`));
        }
    }
    /**
     * 임계값 확인
     */
    async checkThresholds() {
        for (const [collection, metricsList] of this.metrics) {
            const recentMetrics = metricsList.slice(-5);
            for (const metric of recentMetrics) {
                if (metric.queryTime > PERFORMANCE_THRESHOLDS.QUERY_TIME_CRITICAL) {
                    await this.alertCriticalPerformance(collection, metric, 'QUERY_TIME_CRITICAL');
                }
                if (metric.readCount > PERFORMANCE_THRESHOLDS.READ_COUNT_CRITICAL) {
                    await this.alertCriticalPerformance(collection, metric, 'READ_COUNT_CRITICAL');
                }
            }
        }
    }
    /**
     * 중요 성능 이슈 알림
     */
    async alertCriticalPerformance(collection, metric, alertType) {
        const alert = {
            type: alertType,
            collection,
            metric,
            timestamp: new Date(),
            severity: 'critical',
        };
        console.error(`🚨 중요 성능 이슈 감지:`, alert);
        // 성능 메트릭을 데이터베이스에 저장
        try {
            await this.firestoreService.create(COLLECTIONS.PERFORMANCE_METRICS, {
                alertType,
                collection,
                queryTime: metric.queryTime,
                readCount: metric.readCount,
                writeCount: metric.writeCount,
                operation: metric.operation,
                severity: 'critical',
            });
        }
        catch (error) {
            console.error('성능 알림 저장 실패:', error);
        }
    }
    /**
     * 메트릭 기록
     */
    async recordMetrics(collection, metrics) {
        if (!this.metrics.has(collection)) {
            this.metrics.set(collection, []);
        }
        const collectionMetrics = this.metrics.get(collection);
        collectionMetrics.push(metrics);
        // 최대 100개의 메트릭만 메모리에 유지
        if (collectionMetrics.length > 100) {
            collectionMetrics.splice(0, collectionMetrics.length - 100);
        }
        // 개발 환경에서는 성능 메트릭을 콘솔에 출력
        if (process.env.NODE_ENV === 'development' && metrics.queryTime > 100) {
            console.log(`⏱️  ${collection}.${metrics.operation}: ${metrics.queryTime}ms, ${metrics.readCount} reads`);
        }
    }
    /**
     * 현재 읽기 카운트 (모의 구현)
     */
    async getCurrentReadCount() {
        // Firebase Admin SDK에서는 직접적인 읽기 카운트를 제공하지 않으므로
        // 실제 구현에서는 캐시나 별도 카운터를 사용해야 합니다.
        return 0;
    }
    /**
     * 현재 쓰기 카운트 (모의 구현)
     */
    async getCurrentWriteCount() {
        // Firebase Admin SDK에서는 직접적인 쓰기 카운트를 제공하지 않으므로
        // 실제 구현에서는 캐시나 별도 카운터를 사용해야 합니다.
        return 0;
    }
    /**
     * 성능 리포트 생성
     */
    generatePerformanceReport() {
        const collections = {};
        let totalQueries = 0;
        let totalQueryTime = 0;
        let slowQueries = 0;
        const recommendations = [];
        for (const [collection, metricsList] of this.metrics) {
            if (metricsList.length === 0)
                continue;
            const avgQueryTime = metricsList.reduce((sum, m) => sum + m.queryTime, 0) / metricsList.length;
            const maxQueryTime = Math.max(...metricsList.map(m => m.queryTime));
            const totalReads = metricsList.reduce((sum, m) => sum + m.readCount, 0);
            collections[collection] = {
                queryCount: metricsList.length,
                avgQueryTime: Math.round(avgQueryTime),
                maxQueryTime,
                totalReads,
                operations: this.getOperationStats(metricsList),
            };
            totalQueries += metricsList.length;
            totalQueryTime += metricsList.reduce((sum, m) => sum + m.queryTime, 0);
            slowQueries += metricsList.filter(m => m.queryTime > PERFORMANCE_THRESHOLDS.QUERY_TIME_WARNING).length;
            // 컬렉션별 추천사항
            if (avgQueryTime > PERFORMANCE_THRESHOLDS.QUERY_TIME_WARNING) {
                recommendations.push(`${collection}: 평균 쿼리 시간이 높습니다. 인덱스 최적화를 고려하세요.`);
            }
        }
        const summary = {
            totalQueries,
            avgQueryTime: totalQueries > 0 ? Math.round(totalQueryTime / totalQueries) : 0,
            slowQueriesPercent: totalQueries > 0 ? Math.round((slowQueries / totalQueries) * 100) : 0,
            monitoringDuration: this.isMonitoring ? 'Active' : 'Stopped',
        };
        return { collections, summary, recommendations };
    }
    /**
     * 작업별 통계
     */
    getOperationStats(metrics) {
        const operations = {};
        metrics.forEach(metric => {
            if (!operations[metric.operation]) {
                operations[metric.operation] = { count: 0, avgTime: 0 };
            }
            const operation = operations[metric.operation];
            if (operation) {
                operation.count++;
                operation.avgTime += metric.queryTime;
            }
        });
        // 평균 시간 계산
        Object.keys(operations).forEach(op => {
            const operation = operations[op];
            if (operation) {
                operation.avgTime = Math.round(operation.avgTime / operation.count);
            }
        });
        return operations;
    }
    /**
     * 메트릭 초기화
     */
    clearMetrics() {
        this.metrics.clear();
        console.log('📊 성능 메트릭이 초기화되었습니다.');
    }
}
