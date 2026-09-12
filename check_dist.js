const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('find /root/propnexai-main-server -name "*.js" -path "*/dist/*" | head -20 2>&1', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('Dist files:', out);
      
      // Check where the dist actually is
      conn.exec('ls /root/propnexai-main-server/ 2>&1 && ls /root/propnexai-main-server/dist/ 2>&1 | head -10', (e2, s2) => {
        let o2 = '';
        s2.on('data', d => o2 += d.toString());
        s2.on('close', () => {
          console.log('Server structure:', o2);
          conn.end();
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
