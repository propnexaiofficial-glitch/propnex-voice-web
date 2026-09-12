const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Check the actual campaign worker JS being used by PM2
  conn.exec('grep -r "voicebotProvider\\|provider_name\\|voicebot" /root/propnexai-main-server/server/ 2>&1 | head -30', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('Server dir voicebot refs:', out);
      
      // Also try the test-voicelink.js which might have configs
      conn.exec('cat /root/propnexai-main-server/test-voicelink.js 2>&1 | head -50', (e2, s2) => {
        let o2 = '';
        s2.on('data', d => o2 += d.toString());
        s2.on('close', () => {
          console.log('\ntest-voicelink.js:', o2);
          
          // Check the full .env for Bonvoice settings
          conn.exec('cat /root/propnexai-main-server/.env 2>&1', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('\nFull .env:', o3);
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
