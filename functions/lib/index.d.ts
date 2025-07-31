import * as functions from "firebase-functions";
export declare const analyzeEmotion: functions.HttpsFunction & functions.Runnable<any>;
export declare const detectCrisis: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const matchExpert: functions.HttpsFunction & functions.Runnable<any>;
export declare const sendNotification: functions.HttpsFunction & functions.Runnable<any>;
export declare const manageUser: functions.CloudFunction<import("firebase-admin/auth").UserRecord>;
//# sourceMappingURL=index.d.ts.map