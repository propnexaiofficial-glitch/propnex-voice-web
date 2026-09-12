const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // 1. Check Redis for any queued BullMQ jobs
  conn.exec('redis-cli -h 200.234.34.240 -p 6379 -a "Propnexai@123" --no-auth-warning KEYS "bull:*" 2>&1 | head -30', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('=== BullMQ Redis Keys ===');
      console.log(out);
      
      // 2. Check campaign execution queue status
      conn.exec('redis-cli -h 200.234.34.240 -p 6379 -a "Propnexai@123" --no-auth-warning LLEN "bull:campaign-execution:wait" 2>&1', (e2, s2) => {
        let o2 = '';
        s2.on('data', d => o2 += d.toString());
        s2.on('close', () => {
          console.log('\nCampaign jobs waiting:', o2.trim());
          
          // 3. Check active campaign execution records in DB via server logs
          conn.exec('grep -i "campaign\\|worker\\|queue\\|BullMQ\\|job" /root/propnexai-main-server/startup-out.txt 2>&1 | tail -20', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('\nStartup campaign logs:', o3);
              
              // 4. Check current campaign execution status via API
              conn.exec('curl -s http://localhost:3002/api/campaign-execution/status 2>&1', (e4, s4) => {
                let o4 = '';
                s4.on('data', d => o4 += d.toString());
                s4.on('close', () => {
                  console.log('\nCampaign execution API:', o4);
                  conn.end();
                });
              });
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
