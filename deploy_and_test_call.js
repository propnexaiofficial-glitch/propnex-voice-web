const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Deploying and testing...');
  
  // Step 1: Build and restart the server with the new code
  conn.exec(`cd /root/propnexai-main-server && git stash 2>/dev/null; git pull origin main && npm run build 2>&1 | tail -5 && pm2 restart propnexai-main-server && echo "SERVER RESTARTED"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => { process.stdout.write(d.toString()); out += d.toString(); });
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => {
      if (out.includes('SERVER RESTARTED')) {
        console.log('\n✅ Server deployed! Now making test call...\n');
        
        // Wait a moment for server to restart
        setTimeout(() => {
          // Step 2: Test the correct endpoint with a real call
          conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/usermanagement/external-auth/ -H "Content-Type: application/json" -d '{"username":"PROP_NEXT","password":"PRopne##xt89"}' 2>&1`, (e2, s2) => {
            if (e2) { conn.end(); return; }
            let authOut = '';
            s2.on('data', d => authOut += d.toString());
            s2.on('close', () => {
              console.log('Auth response:', authOut);
              try {
                const data = JSON.parse(authOut);
                const token = data.data?.token;
                if (!token) { console.log('No token!'); conn.end(); return; }
                
                console.log('Got token, making call to 8851860838 from 07946350797...');
                const callBody = JSON.stringify({
                  autocallType: "5",
                  destination: "8851860838",
                  legACallerID: "07946350797",
                  eventID: "test-propnex-" + Date.now(),
                  voicebotProvider: "custom",
                  voicebotURL: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
                });
                
                conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${callBody}' 2>&1`, (e3, s3) => {
                  if (e3) { conn.end(); return; }
                  let callOut = '';
                  s3.on('data', d => callOut += d.toString());
                  s3.on('close', () => {
                    console.log('📞 Call API Response:', callOut);
                    conn.end();
                  });
                });
              } catch(e) {
                console.error('Failed to parse auth:', e.message);
                conn.end();
              }
            });
          });
        }, 5000);
      } else {
        console.log('Deploy may have issues, checking...');
        conn.end();
      }
    });
  });
}).connect({
  host: 'propnexai.com',
  port: 22,
  username: 'root',
  password: 'Propnexai@123'
});
