const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://propnex_admin:Propnexai%40123@200.234.34.240:27017/propnex?authSource=admin&replicaSet=rs0';

async function checkOtpLogs() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected to MongoDB\n');

  const db = client.db('propnex');

  // List all collections to see what exists
  const collections = await db.listCollections().toArray();
  console.log('=== ALL COLLECTIONS IN DB ===');
  collections.forEach(c => console.log(' -', c.name));
  console.log('');

  // Check OtpLog collection (Prisma uses model name as-is for MongoDB)
  const possibleNames = ['OtpLog', 'otpLog', 'otp_log', 'OtpLogs', 'otpLogs'];
  for (const name of possibleNames) {
    try {
      const count = await db.collection(name).countDocuments();
      if (count >= 0) {
        console.log(`Collection "${name}": ${count} documents`);
        if (count > 0) {
          const latest = await db.collection(name).find({}).sort({ createdAt: -1 }).limit(3).toArray();
          console.log('Latest 3 OTP logs:');
          latest.forEach(doc => console.log(JSON.stringify(doc, null, 2)));
        }
      }
    } catch (e) {}
  }

  // Insert a test OTP log directly to confirm the correct collection name
  const testDoc = {
    type: 'test_otp',
    email: 'satish@test.com',
    otp: '123456',
    userName: 'Satish Test',
    domain: 'propnexai.com',
    companyName: 'PropNex AI',
    status: 'SENT',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    createdAt: new Date(),
  };

  // Try inserting into OtpLog (the Prisma model name)
  const result = await db.collection('OtpLog').insertOne(testDoc);
  console.log(`\n✅ Inserted test OTP into "OtpLog" collection: ${result.insertedId}`);

  // Verify it's there
  const verify = await db.collection('OtpLog').countDocuments();
  console.log(`Total documents in "OtpLog": ${verify}`);

  await client.close();
}

checkOtpLogs().catch(e => { console.error('Error:', e.message); process.exit(1); });
