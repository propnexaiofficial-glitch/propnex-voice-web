const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected');
  conn.exec('grep -c voicelink /root/propnexai-main-server/dist/server/queues/campaign-execution.worker.js 2>&1', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Voicelink ref count in dist:', out.trim());
      // Check the actual token parsing
      conn.exec("grep -n 'data\\.token\\|data\\.access_token\\|loginData' /root/propnexai-main-server/dist/server/queues/campaign-execution.worker.js 2>&1 | head -5", (e2, s2) => {
        if (e2) { conn.end(); return; }
        let o2 = '';
        s2.on('data', d => o2 += d);
        s2.on('close', () => {
          console.log('Token extraction code:', o2);
          // Now run a direct Bonvoice token test from server
          conn.exec(`node -e "
const d = {status:'1',data:{token:'27d4d72e911173a1e171007d98d8d2d1fd4bfa85',token_type:'Header'}};
const t = d.token || d.access_token || d.data?.token || d.data?.access_token;
console.log('token:', t ? 'FOUND:' + t.substring(0,20) : 'NOT FOUND');
"`, (e3, s3) => {
            if (e3) { conn.end(); return; }
            let o3 = '';
            s3.on('data', d => o3 += d);
            s3.on('close', () => {
              console.log('Token parse test:', o3);
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
