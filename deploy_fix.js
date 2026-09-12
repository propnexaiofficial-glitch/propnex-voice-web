const { Client } = require('ssh2'); 
const conn = new Client(); 
conn.on('ready', () => { 
  console.log('Client :: ready'); 
  const cmd = `cd /root/propnex-voice-web && npm run build && pm2 restart propnexai-frontend`;
  conn.exec(cmd, (err, stream) => { 
    if (err) throw err; 
    stream.on('close', (code, signal) => { 
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal); 
      conn.end(); 
    }).on('data', (data) => { 
      console.log('STDOUT: ' + data.toString()); 
    }).stderr.on('data', (data) => { 
      console.log('STDERR: ' + data.toString()); 
    }); 
  }); 
}).connect({ 
  host: 'propnexai.com', 
  port: 22, 
  username: 'root', 
  password: 'Propnexai@123' 
});
