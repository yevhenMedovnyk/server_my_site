// firebaseAdmin.ts
const admin = require('firebase-admin');
const { set } = require('mongoose');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

//async function setAdminClaim(uid) {
//  try {
//    await admin.auth().setCustomUserClaims(uid, { isAdmin: true });
//    console.log(`Користувачу ${uid} встановлено isAdmin: true`);
//  } catch (error) {
//    console.error('Помилка при встановленні claims:', error);
//  }
//}

//setAdminClaim("BVQ224XM17O9TuO4KEG4jzwAtpv2");

module.exports = admin;
