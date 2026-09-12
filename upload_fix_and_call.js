const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

// The server doesn't have git. We need to manually copy the fixed file.
// Read the fixed worker file locally
const workerFile = fs.readFileSync(
  path.join('C:\\Users\\farhan khalid\\OneDrive\\Pictures\\Documents\\Propnex\\propnexai-main-server\\src\\server\\queues\\campaign-execution.worker.ts'),
  'utf8'
);

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected. Uploading fixed worker file and rebuilding...');
  
  // Step 1: Write the fixed TS file to the server
  // Use sftp to upload
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    const remotePath = '/root/propnexai-main-server/src/server/queues/campaign-execution.worker.ts';
    const writeStream = sftp.createWriteStream(remotePath);
    
    writeStream.on('close', () => {
      console.log('File uploaded! Building...');
      sftp.end();
      
      // Step 2: Rebuild the TypeScript
      conn.exec('cd /root/propnexai-main-server && npm run build 2>&1 | tail -10 && pm2 restart propnexai-main-server && echo "BUILD_DONE"', (e2, s2) => {
        if (e2) throw e2;
        s2.on('data', d => process.stdout.write(d.toString()));
        s2.stderr.on('data', d => process.stderr.write(d.toString()));
        s2.on('close', () => {
          console.log('\nServer restarted! Testing the call...');
          
          // Wait for restart
          setTimeout(() => {
            // Get fresh token
            conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/usermanagement/external-auth/ -H "Content-Type: application/json" -d '{"username":"PROP_NEXT","password":"PRopne##xt89"}'`, (e3, s3) => {
              let authOut = '';
              s3.on('data', d => authOut += d.toString());
              s3.on('close', () => {
                console.log('Auth:', authOut);
                try {
                  const token = JSON.parse(authOut).data.token;
                  
                  // Try calling with the DID that is in the DB for farhanthehero13
                  // First check what numbers are assigned
                  conn.exec(`curl -s https://backend.pbx.bonvoice.com/didManagement/assignednumbers/ -H "Authorization: Token ${token}" -H "Accept: application/json" 2>&1`, (e4, s4) => {
                    let dids = '';
                    s4.on('data', d => dids += d.toString());
                    s4.on('close', () => {
                      console.log('\n=== BONVOICE ASSIGNED NUMBERS ===');
                      console.log(dids);
                      
                      // Try the call with the first available DID
                      try {
                        const parsedDids = JSON.parse(dids);
                        const firstDid = (parsedDids.data && parsedDids.data[0]) || (Array.isArray(parsedDids) && parsedDids[0]);
                        const didToUse = firstDid ? (firstDid.did_number || firstDid.number || firstDid) : '07946350797';
                        console.log('Using DID:', didToUse);
                        
                        conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '{"autocallType":"5","destination":"8851860838","legACallerID":"${didToUse}","eventID":"test-${Date.now()}","voicebotProvider":"custom","voicebotURL":"wss://vineeth-inbound.onrender.com/ws/voice-agent"}' 2>&1`, (e5, s5) => {
                          let callOut = '';
                          s5.on('data', d => callOut += d.toString());
                          s5.on('close', () => {
                            console.log('\n=== CALL API RESPONSE ===');
                            console.log(callOut);
                            conn.end();
                          });
                        });
                      } catch(e) {
                        console.log('Could not parse DIDs, trying with 07946350797...');
                        conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '{"autocallType":"5","destination":"8851860838","legACallerID":"07946350797","eventID":"test-${Date.now()}","voicebotProvider":"custom","voicebotURL":"wss://vineeth-inbound.onrender.com/ws/voice-agent"}' 2>&1`, (e5, s5) => {
                          let callOut = '';
                          s5.on('data', d => callOut += d.toString());
                          s5.on('close', () => {
                            console.log('\n=== CALL RESPONSE ===');
                            console.log(callOut);
                            conn.end();
                          });
                        });
                      }
                    });
                  });
                } catch(e) {
                  console.error('Auth parse error:', e.message);
                  conn.end();
                }
              });
            });
          }, 4000);
        });
      });
    });
    
    writeStream.write(workerFile);
    writeStream.end();
  });
}).connect({
  host: 'propnexai.com',
  port: 22,
  username: 'root',
  password: 'Propnexai@123'
});
