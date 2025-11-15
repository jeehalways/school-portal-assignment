// Firebase Admin initialization
// Inicializes Firebase Admin using credentials from .env
// Used for: verifying ID tokens; getting Firebase data (rare)
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config(); // Load .env

if (!process.env.FIREBASE_ADMIN_CRED) {
  throw new Error("FIREBASE_ADMIN_CRED is missing in .env");
}

const cred = JSON.parse(process.env.FIREBASE_ADMIN_CRED);

admin.initializeApp({
  credential: admin.credential.cert(cred),
});

export default admin;
