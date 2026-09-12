const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Check all env files on the server for any reference to voicebot provider name
  conn.exec('grep -ri "voicebot\\|VOICEBOT\\|provider" /root/propnexai-main-server/.env 2>&1', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.stderr.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('ENV voicebot vars:', out);
      
      // Also check the dist worker for any hardcoded provider name
      conn.exec('grep -i "provider\\|voicebot" /root/propnexai-main-server/dist/server/queues/campaign-execution.worker.js 2>&1 | grep -v "//\\|providerCallId"', (e2, s2) => {
        let out2 = '';
        s2.on('data', d => out2 += d.toString());
        s2.on('close', () => {
          console.log('\nDist worker provider references:', out2);
          
          // Also check for any old Voicelink/OBD references that had provider names
          conn.exec('grep -ri "provider_name\\|providerName\\|voicebot_provider" /root/propnexai-main-server/.env 2>&1', (e3, s3) => {
            let out3 = '';
            s3.on('data', d => out3 += d.toString());
            s3.on('close', () => {
              console.log('\nProvider name env vars:', out3 || 'NONE');
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
