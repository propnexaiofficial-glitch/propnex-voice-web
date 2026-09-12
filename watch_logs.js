const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('Watching server logs for call activity...\n');
  // Stream live PM2 logs for 30 seconds to see calls being made
  conn.exec('timeout 30 pm2 logs propnexai-main-server --lines 0 2>&1', (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => {
      console.log('\n--- 30s log window complete ---');
      conn.end();
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
