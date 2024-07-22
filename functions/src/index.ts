import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

exports.addUserFirestore = functions.auth.user().onCreate((user) => {
  return admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

exports.deleteUserFirestore = functions.auth.user().onDelete((user) => {
  const doc = admin.firestore().collection("users").doc(user.uid);
  return doc.delete();
});

