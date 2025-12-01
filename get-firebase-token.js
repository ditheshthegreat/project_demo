#!/usr/bin/env node

/**
 * Get Firebase Authentication Token
 * 
 * This script authenticates with Firebase and outputs a valid ID token
 * that can be used for testing APIs in Swagger or with cURL.
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Firebase configuration from .env
const firebaseConfig = {
  apiKey: process.env.FIREBASE_WEB_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

// Test user credentials from .env
const email = process.env.TEST_USER_EMAIL || 'ajith@inklusio.com';
const password = process.env.TEST_USER_PASSWORD || 'Ajith@123';

console.log('\n🔐 Getting Firebase Authentication Token...\n');
console.log(`📧 Email: ${email}`);
console.log(`🔑 Project: ${firebaseConfig.projectId}\n`);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign in and get token
signInWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    const user = userCredential.user;
    const token = await user.getIdToken();
    
    console.log('✅ Authentication Successful!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 FIREBASE ID TOKEN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(token);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 USER INFO:');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Email Verified: ${user.emailVerified}\n`);
    
    console.log('📚 HOW TO USE THIS TOKEN:\n');
    console.log('1️⃣  Copy the token above\n');
    console.log('2️⃣  In Swagger UI (http://localhost:3000/api/docs):');
    console.log('   - Click "Authorize" 🔒');
    console.log('   - Paste the token');
    console.log('   - Click "Authorize" button\n');
    console.log('3️⃣  For cURL commands:');
    console.log('   export TOKEN="paste-token-here"');
    console.log('   curl http://localhost:3000/api/onboarding/status \\');
    console.log('     -H "Authorization: Bearer $TOKEN"\n');
    
    console.log('⏰ Token expires in: 1 hour\n');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Authentication Failed!\n');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('\n💡 Tips:');
    console.error('   - Check if the user exists in Firebase');
    console.error('   - Verify credentials in .env file');
    console.error('   - Ensure Firebase project is active\n');
    process.exit(1);
  });
