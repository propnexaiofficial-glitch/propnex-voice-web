const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Check what the dist worker has and what the server/queues worker has
  conn.exec('grep -n "click2call\\|autoCallBridging\\|autocallType\\|voicebotProvider\\|source_number\\|BONVOICE" /root/propnexai-main-server/dist/server/queues/campaign-execution.worker.js 2>&1 | head -20', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('=== dist/server/queues worker (currently running) ===');
      console.log(out);
      
      conn.exec('grep -n "click2call\\|autoCallBridging\\|autocallType\\|source_number\\|BONVOICE" /root/propnexai-main-server/server/queues/campaign-execution.worker.js 2>&1 | head -20', (e2, s2) => {
        let o2 = '';
        s2.on('data', d => o2 += d.toString());
        s2.on('close', () => {
          console.log('\n=== server/queues worker ===');
          console.log(o2);
          
          // Check what PM2 is actually running
          conn.exec('pm2 show propnexai-main-server 2>&1 | grep -E "script|cwd|pid"', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('\n=== PM2 process details ===');
              console.log(o3);
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
