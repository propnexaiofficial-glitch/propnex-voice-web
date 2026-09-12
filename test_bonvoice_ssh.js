const { Client } = require('ssh2');

const script = `
const https = require('https');

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  console.log('=== Testing Bonvoice Auth ===');
  const authBody = JSON.stringify({ username: 'PROP_NEXT', password: 'PRopne##xt89' });
  const authOpts = {
    hostname: 'backend.pbx.bonvoice.com',
    path: '/usermanagement/external-auth/',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Content-Length': Buffer.byteLength(authBody) }
  };
  
  try {
    const authRes = await makeRequest(authOpts, authBody);
    console.log('Auth Status:', authRes.status);
    console.log('Auth Body:', authRes.body);
    
    if (authRes.status !== 200) { console.log('FAILED AUTH'); return; }
    
    const d = JSON.parse(authRes.body);
    const token = d.token || d.access_token || (d.data && (d.data.token || d.data.access_token));
    if (!token) { console.log('NO TOKEN in response'); return; }
    console.log('Token:', token.substring(0,20) + '...');
    
    console.log('\\n=== Making Test Call ===');
    const callBody = JSON.stringify({
      source_number: '+917946350797',
      destination_number: '8851860838',
      template_url: 'wss://vineeth-inbound.onrender.com/ws/voice-agent',
      reference_id: 'test-' + Date.now()
    });
    const callOpts = {
      hostname: 'backend.pbx.bonvoice.com',
      path: '/click2call/',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Token ' + token, 'Content-Length': Buffer.byteLength(callBody) }
    };
    const callRes = await makeRequest(callOpts, callBody);
    console.log('Call Status:', callRes.status);
    console.log('Call Body:', callRes.body);
  } catch(e) {
    console.error('Error:', e.message);
  }
}
run();
`;

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected');
  // Write the script to a temp file and run it
  conn.exec(`cat > /tmp/bonvoice_test.js << 'HEREDOC'\n${script}\nHEREDOC\nnode /tmp/bonvoice_test.js`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => { conn.end(); });
  });
}).connect({
  host: 'propnexai.com',
  port: 22,
  username: 'root',
  password: 'Propnexai@123'
});
