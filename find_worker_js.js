const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Find the actual JS file being run by the campaign worker
  conn.exec('find /root/propnexai-main-server -name "campaign-execution.worker.js" 2>&1 | grep -v node_modules', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('Worker JS files:', out);
      
      // Also check how PM2 runs the server
      conn.exec('cat /root/propnexai-main-server/ecosystem.config.cjs 2>&1', (e2, s2) => {
        let o2 = '';
        s2.on('data', d => o2 += d.toString());
        s2.on('close', () => {
          console.log('\nEcosystem config:', o2);
          
          // Check the main entry point
          conn.exec('cat /root/propnexai-main-server/package.json 2>&1 | grep -A5 "scripts"', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('\nPackage scripts:', o3);
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
