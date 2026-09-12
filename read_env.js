const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  conn.exec('cat /root/propnexai-main-server/.env', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      // Print env but hide password fields
      const lines = out.split('\n').map(l => {
        if (l.includes('PASSWORD') || l.includes('SECRET') || l.includes('KEY') || l.includes('TOKEN')) {
          const eq = l.indexOf('=');
          return l.substring(0, eq+1) + '***HIDDEN***';
        }
        return l;
      });
      console.log(lines.join('\n'));
      conn.end();
    });
  });
}).connect({
  host: 'propnexai.com',
  port: 22,
  username: 'root',
  password: 'Propnexai@123'
});
