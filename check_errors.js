const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Check PM2 error logs specifically for failed calls
  conn.exec('pm2 logs propnexai-main-server --lines 100 --nostream 2>&1 | grep -E "Failed|Error|Bonvoice|📞|autocall|TTS|speechContent|DID|invalid" | head -30', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('=== Filtered Error Logs ===');
      console.log(out || 'No matching lines');
      
      // Also check the PM2 error log file
      conn.exec('cat /root/propnexai-main-server/logs/err.log 2>&1 | tail -50', (e2, s2) => {
        let e2out = '';
        s2.on('data', d => e2out += d.toString());
        s2.on('close', () => {
          console.log('\n=== PM2 Error Log (err.log) ===');
          console.log(e2out || 'Empty');
          
          // Check out.log for the 📞 calls
          conn.exec('grep -a "📞\\|Calling\\|Failed to push\\|Bonvoice\\|autoCall\\|responseCode\\|autocallType" /root/propnexai-main-server/logs/out.log 2>&1 | tail -20', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('\n=== Outbound Call Logs ===');
              console.log(o3 || 'No matching entries');
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
