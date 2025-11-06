/**
 * Simple script to generate a JWT token for API authentication
 * Usage: node src/scripts/generate-token.js
 * 
 * This generates a token with:
 * - id: 1 (admin user ID)
 * - role: "admin"
 * 
 * Copy the token and add it to your frontend .env.local as NEXT_PUBLIC_JWT_TOKEN
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
// const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || "7d"; // Default 7 days

if (!ACCESS_SECRET) {
  console.error('❌ ERROR: JWT_ACCESS_SECRET not found in environment variables');
  console.error('Please add JWT_ACCESS_SECRET to your .env file');
  process.exit(1);
}

// Generate token with admin payload
const payload = {
  id: 1,
  role: "admin"
};

const token = jwt.sign(payload, ACCESS_SECRET);

console.log('\n✅ Token generated successfully!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Copy this token to your frontend .env.local file:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`NEXT_PUBLIC_JWT_TOKEN=${token}\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
// console.log('Token expires in:', ACCESS_EXPIRES);
console.log('Token payload:', JSON.stringify(payload, null, 2));
console.log('\n');

