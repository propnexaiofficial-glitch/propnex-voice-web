const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Check call log status via the server API directly (no mongo needed)
  // And check Redis state for the active campaign  
  const redis = 'redis-cli -h 200.234.34.240 -p 6379 -a "Propnexai@123" --no-auth-warning';
  
  conn.exec(`${redis} KEYS "bull:campaign-execution-queue:*" 2>&1`, (err, stream) => {
    if (err) throw err;
    let keys = '';
    stream.on('data', d => keys += d.toString());
    stream.on('close', () => {
      console.log('Queue keys now:', keys);
      
      // Check campaign state in Redis
      conn.exec(`${redis} KEYS "campaign:*" 2>&1`, (e2, s2) => {
        let campKeys = '';
        s2.on('data', d => campKeys += d.toString());
        s2.on('close', () => {
          console.log('\nCampaign state keys:', campKeys);
          
          if (campKeys.trim()) {
            const firstKey = campKeys.trim().split('\n')[0];
            conn.exec(`${redis} GET "${firstKey}" 2>&1`, (e3, s3) => {
              let state = '';
              s3.on('data', d => state += d.toString());
              s3.on('close', () => {
                console.log(`\nCampaign state (${firstKey}):`, state.substring(0, 500));
                conn.end();
              });
            });
          } else {
            // Check last PM2 logs for any 📞 or Bonvoice output
            conn.exec('pm2 logs propnexai-main-server --lines 30 --nostream 2>&1 | grep -E "📞|Calling|autoCall|Bonvoice|BONVOICE|Failed|Success|200|Error" | head -20', (e4, s4) => {
              let log = '';
              s4.on('data', d => log += d.toString());
              s4.on('close', () => {
                console.log('\nFiltered recent logs:', log || 'No call-related logs found');
                conn.end();
              });
            });
          }
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
