const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://propnex_admin:Propnexai%40123@200.234.34.240:27017/propnex?authSource=admin&replicaSet=rs0';

async function clearGlobalLogout() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected to MongoDB');

  const db = client.db('propnex');

  // Remove the global_logout_at setting — force-logout is complete, Remember Me can work normally
  const result = await db.collection('GlobalSetting').deleteOne({ key: 'global_logout_at' });
  
  if (result.deletedCount > 0) {
    console.log('\n✅ global_logout_at cleared from database');
    console.log('   Remember Me / trusted devices will now work normally again.');
    console.log('   To force-logout everyone again in future, run: node trigger-logout.cjs\n');
  } else {
    console.log('\n⚠️  global_logout_at was not found (already cleared)\n');
  }

  await client.close();
}

clearGlobalLogout().catch(e => { console.error('Error:', e.message); process.exit(1); });
