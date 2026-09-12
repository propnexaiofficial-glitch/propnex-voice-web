const { Client } = require('ssh2');

// Auth token obtained: 27d4d72e911173a1e171007d98d8d2d1fd4bfa85
// But the token structure is: { status: "1", data: { token: "...", token_type: "Header" } }
// The worker code looks for loginData.token || loginData.access_token || loginData.data?.token
// loginData.data?.token IS the right path. Let's confirm this is working or not

// The actual ISSUE from the logs: "Failed to push lead X to Voicelink: DID number not found"
// This error message says VOICELINK, not Bonvoice - this is from the OLD worker code. 
// Let's check what the built dist version looks like vs the TS source

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected');
  // Check the built worker - it might have old code
  conn.exec('head -60 /root/propnexai-main-server/dist/server/queues/campaign-execution.worker.js 2>&1', (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => {
      // Also check what API URL the built dist is using
      conn.exec("grep -n 'voicelink\\|click2call\\|BONVOICE\\|pbx.bon' /root/propnexai-main-server/dist/server/queues/campaign-execution.worker.js 2>&1 | head -20", (err2, stream2) => {
        if (err2) { conn.end(); return; }
        stream2.on('data', d => process.stdout.write(d.toString()));
        stream2.stderr.on('data', d => process.stderr.write(d.toString()));
        stream2.on('close', () => conn.end());
      });
    });
  });
}).connect({
  host: 'propnexai.com',
  port: 22,
  username: 'root',
  password: 'Propnexai@123'
});
