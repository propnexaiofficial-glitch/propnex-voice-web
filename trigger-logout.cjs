const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://propnex_admin:Propnexai%40123@200.234.34.240:27017/propnex?authSource=admin&replicaSet=rs0';

async function run() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected to MongoDB');

  const db = client.db('propnex');
  const now = new Date();
  const setDoc = { key: 'global_logout_at', value: now.toISOString(), updatedAt: now };

  await db.collection('GlobalSetting').updateOne(
    { key: 'global_logout_at' },
    { $set: setDoc },
    { upsert: true }
  );

  console.log('');
  console.log('🔴 GLOBAL FORCE-LOGOUT TRIGGERED');
  console.log('   Timestamp:', now.toISOString());
  console.log('   All tokens issued BEFORE this time are now INVALID.');
  console.log('   Every user on every device (phone, laptop, tablet) is now logged out.');
  console.log('   They must sign in again with OTP to regain access.');
  console.log('');

  await client.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
