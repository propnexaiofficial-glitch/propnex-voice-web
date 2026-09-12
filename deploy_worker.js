const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localPath = 'c:/Users/farhan khalid/OneDrive/Pictures/Documents/Propnex/propnexai-main-server/dist/server/queues/campaign-execution.worker.js';
    const remotePath = '/root/propnexai-main-server/dist/server/queues/campaign-execution.worker.js';
    
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) throw err;
      console.log('Worker file uploaded successfully!');
      
      // Remove USE_SCHOOLKNOT_API from .env
      conn.exec('sed -i "/^USE_SCHOOLKNOT_API=/d" /root/propnexai-main-server/.env', (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          console.log('Env var USE_SCHOOLKNOT_API removed.');
          // Now restart PM2
          conn.exec('pm2 restart propnexai-main-server', (err, pm2Stream) => {
            if (err) throw err;
            let out = '';
            pm2Stream.on('data', d => out += d.toString());
            pm2Stream.on('close', () => {
              console.log('PM2 Restart Result:', out);
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
