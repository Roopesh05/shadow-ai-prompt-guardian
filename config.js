const FIREBASE_CONFIG = {
  projectId: "YOUR_PROJECT_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  apiKey: "YOUR_API_KEY"
};

if (typeof globalThis !== 'undefined') {
  globalThis.FIREBASE_CONFIG = FIREBASE_CONFIG;
}

export default FIREBASE_CONFIG;
