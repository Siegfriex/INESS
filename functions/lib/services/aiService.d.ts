import * as functions from 'firebase-functions';
export declare const emotionAnalysisHandler: (data: any, context: functions.https.CallableContext) => Promise<{
    success: boolean;
    emotion: string;
    confidence: number;
    message: string;
}>;
//# sourceMappingURL=aiService.d.ts.map