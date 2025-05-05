// scripts/hash-password.js
const bcrypt = require('bcrypt');

// ---- SET YOUR DESIRED PASSWORD HERE ----
const password = '123'; // Replace '123' with your actual desired admin password
// ---------------------------------------

const saltRounds = 10; // Standard number of salt rounds

if (!password) {
  console.error('Error: Please set the password variable in the script.');
  process.exit(1);
}

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('BCrypt Hash:', hash);
  console.log('\nCopy this hash into your .env.local file as ADMIN_PASSWORD_HASH');
});