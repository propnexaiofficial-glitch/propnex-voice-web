const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Check call status in MongoDB for this campaign
  conn.exec(`mongo "mongodb://propnex_admin:Propnexai%40123@200.234.34.240:27017/propnex?authSource=admin" --eval "db.CallLog.find({campaignId:'camp-1789112527920'},{phone:1,status:1,providerStatus:1,direction:1,createdAt:1,_id:0}).sort({createdAt:-1}).limit(10).pretty()" --quiet 2>&1`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('=== Call Log Status for campaign ===');
      console.log(out || 'No output');
      
      // Also try mongosh
      conn.exec(`mongosh "mongodb://propnex_admin:Propnexai%40123@200.234.34.240:27017/propnex?authSource=admin" --eval "db.CallLog.find({campaignId:'camp-1789112527920'},{status:1,providerStatus:1,direction:1,startedAt:1}).sort({createdAt:-1}).limit(10)" --quiet 2>&1`, (e2, s2) => {
        let o2 = '';
        s2.on('data', d => o2 += d.toString());
        s2.on('close', () => {
          console.log('\nmongosh result:', o2 || 'No output');
          conn.end();
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
