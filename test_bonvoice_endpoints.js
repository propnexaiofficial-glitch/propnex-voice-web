const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected');
  // Try different Bonvoice click2call API paths
  const token = '27d4d72e911173a1e171007d98d8d2d1fd4bfa85';
  const paths = [
    '/click2call/',
    '/api/v1/click2call/',
    '/api/click2call/',
    '/outbound/click2call/',
    '/telephony/click2call/',
    '/calls/click2call/',
    '/obd/click2call/',
  ];
  
  const testCalls = paths.map(path => 
    `echo "Testing ${path}:" && curl -s -o /dev/null -w "%{http_code}" -X POST https://backend.pbx.bonvoice.com${path} -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '{"source_number":"+917946350797","destination_number":"8851860838","template_url":"wss://vineeth-inbound.onrender.com/ws/voice-agent","reference_id":"test123"}' 2>&1 && echo ""`
  ).join(' && ');

  conn.exec(testCalls, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => {
      // Also try with full response body on the most likely path
      conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/click2call/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '{"source_number":"+917946350797","destination_number":"8851860838","template_url":"wss://vineeth-inbound.onrender.com/ws/voice-agent","reference_id":"test-${Date.now()}"}'`, (err2, stream2) => {
        if (err2) { conn.end(); return; }
        let out = '';
        stream2.on('data', d => out += d.toString());
        stream2.on('close', () => {
          console.log('\nFull response from /click2call/:', out);
          conn.end();
        });
      });
    });
  });
}).connect({
  host: 'propnexai.com',
  port: 22,
  username: 'root',
  password: 'Propnexai@123'
});
