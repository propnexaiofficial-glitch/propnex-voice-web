const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Building and deploying...');
  
  // Step 1: Pull, build, restart
  const buildCmd = 'cd /root/propnexai-main-server && git pull origin main 2>&1 && npm run build 2>&1 | tail -3 && pm2 restart propnexai-main-server 2>&1 | tail -3 && echo "DEPLOY_DONE"';
  
  conn.exec(buildCmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => { process.stdout.write(d.toString()); out += d.toString(); });
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => {
      console.log('\nDeploy finished. Making test call...\n');
      
      setTimeout(() => {
        // Get token
        const authCmd = `curl -s -X POST https://backend.pbx.bonvoice.com/usermanagement/external-auth/ -H "Content-Type: application/json" -d '{"username":"PROP_NEXT","password":"PRopne##xt89"}'`;
        
        conn.exec(authCmd, (e2, s2) => {
          if (e2) { conn.end(); return; }
          let authOut = '';
          s2.on('data', d => authOut += d.toString());
          s2.on('close', () => {
            console.log('Auth response:', authOut);
            try {
              const data = JSON.parse(authOut);
              const token = data.data && data.data.token;
              if (!token) { console.log('No token!'); conn.end(); return; }
              
              console.log('Token obtained! Making call to 8851860838...');
              
              const timestamp = Date.now();
              const callCmd = `curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '{"autocallType":"5","destination":"8851860838","legACallerID":"07946350797","eventID":"test-${timestamp}","voicebotProvider":"custom","voicebotURL":"wss://vineeth-inbound.onrender.com/ws/voice-agent"}'`;
              
              conn.exec(callCmd, (e3, s3) => {
                if (e3) { conn.end(); return; }
                let callOut = '';
                s3.on('data', d => callOut += d.toString());
                s3.on('close', () => {
                  console.log('Call API Response:', callOut);
                  conn.end();
                });
              });
            } catch(e) {
              console.error('Failed to parse auth:', e.message, '| Raw:', authOut);
              conn.end();
            }
          });
        });
      }, 5000);
    });
  });
}).connect({
  host: 'propnexai.com',
  port: 22,
  username: 'root',
  password: 'Propnexai@123'
});
