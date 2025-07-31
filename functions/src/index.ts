import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const analyzeEmotion = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    return { success: true, emotion: "neutral" };
  });

export const detectCrisis = functions
  .region("us-central1")
  .firestore.document("users/{userId}/emotions/{emotionId}")
  .onCreate(async (snap, context) => {
    console.log("Crisis detection triggered");
  });

export const matchExpert = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    return { message: "Expert matching service" };
  });

export const sendNotification = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    return { message: "Notification sent" };
  });

export const manageUser = functions
  .region("us-central1")
  .auth.user()
  .onCreate(async (user) => {
    console.log("New user created:", user.uid);
  });