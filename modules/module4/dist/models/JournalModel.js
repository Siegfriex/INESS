/**
 * Journal 데이터 모델
 * 감정 일기 및 분석 데이터
 */
// 기본 일기 템플릿들
export const defaultJournalTemplates = [
    {
        name: '일일 체크인',
        description: '하루를 마무리하며 감정과 경험을 정리합니다',
        prompts: [
            '오늘 하루는 어땠나요?',
            '가장 기억에 남는 순간은 무엇인가요?',
            '어떤 감정을 많이 느꼈나요?',
            '내일은 어떤 하루가 되었으면 좋겠나요?'
        ],
        category: 'daily',
        difficulty: 'beginner',
        estimatedTime: 10,
    },
    {
        name: '감사 일기',
        description: '긍정적인 마음으로 감사한 것들을 적어봅니다',
        prompts: [
            '오늘 감사한 세 가지는 무엇인가요?',
            '나에게 도움을 준 사람이 있나요?',
            '작은 기쁨이나 행복을 느낀 순간이 있었나요?'
        ],
        category: 'gratitude',
        difficulty: 'beginner',
        estimatedTime: 5,
    },
    {
        name: '감정 탐구',
        description: '복잡한 감정을 깊이 있게 탐색합니다',
        prompts: [
            '지금 느끼는 주된 감정은 무엇인가요?',
            '이 감정이 생긴 이유는 무엇일까요?',
            '이 감정을 어떻게 다루고 싶나요?',
            '이 경험에서 배울 수 있는 것은 무엇인가요?'
        ],
        category: 'reflection',
        difficulty: 'intermediate',
        estimatedTime: 15,
    }
];
