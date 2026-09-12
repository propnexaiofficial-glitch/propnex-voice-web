const { Client } = require('ssh2');
const conn = new Client();
const token = '27d4d72e911173a1e171007d98d8d2d1fd4bfa85';

conn.on('ready', () => {
  console.log('SSH Connected');
  // Try to discover Bonvoice API by hitting the root and /api/
  const commands = [
    `curl -s -o /dev/null -w "%{http_code}" https://backend.pbx.bonvoice.com/api/ -H "Authorization: Token ${token}"`,
    `curl -s -o /dev/null -w "%{http_code}" https://backend.pbx.bonvoice.com/api/schema/ -H "Authorization: Token ${token}"`,
    `curl -s -o /dev/null -w "%{http_code}" https://backend.pbx.bonvoice.com/api/v1/ -H "Authorization: Token ${token}"`,
    `curl -s https://backend.pbx.bonvoice.com/api/ -H "Authorization: Token ${token}" 2>&1 | head -100`,
    // Try outbound call endpoints
    `curl -s -X POST https://backend.pbx.bonvoice.com/api/click2call/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '{"source_number":"+917946350797","destination_number":"8851860838","template_url":"wss://vineeth-inbound.onrender.com/ws/voice-agent"}' 2>&1`,
    `curl -s -X POST https://backend.pbx.bonvoice.com/api/v1/outbound/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '{"source_number":"+917946350797","destination_number":"8851860838"}' 2>&1`,
  ];
  
  const cmd = commands.map((c, i) => `echo "=== Test ${i+1} ===" && ${c}`).join(' && echo "" && ');
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
