require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Admin';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@sterco.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

const run = async () => {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log('Admin user created successfully:');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('Please change this password after first login.');
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
