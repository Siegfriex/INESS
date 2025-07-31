/**
 * Emotion 데이터 모델
 * 감정 체크인 및 분석 데이터
 */
// 기본 위기 감지 설정
export const defaultCrisisIndicators = {
    keywords: [
        '자살', '죽고싶다', '사라지고싶다', '의미없다', '절망적',
        '혼자다', '도움이필요해', '위험해', '해치고싶다'
    ],
    emotionThresholds: {
        sadness: 8,
        anger: 9,
        fear: 8,
    },
    riskFactors: [
        'repeated_high_intensity',
        'declining_trend',
        'isolation_pattern',
        'crisis_keywords'
    ],
    patterns: [
        'sudden_mood_drop',
        'prolonged_negative_state',
        'withdrawal_behavior'
    ],
};
