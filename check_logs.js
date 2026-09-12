const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Check PM2 logs for the main server worker - last 50 lines
  conn.exec('pm2 logs propnexai-main-server --lines 50 --nostream 2>&1', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('=== PM2 LOGS ===');
      console.log(out);
      conn.end();
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
