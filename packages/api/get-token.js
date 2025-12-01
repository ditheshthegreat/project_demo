const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, 'ajith@inklusio.com', 'Ajith@123')
  .then(async (userCredential) => {
    const token = await userCredential.user.getIdToken();
    console.log('\n🔐 Firebase Token:');
    console.log(token);
    console.log('\n✅ Copy this token and use it in Swagger or API calls');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
