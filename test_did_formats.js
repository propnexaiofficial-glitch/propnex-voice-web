const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/usermanagement/external-auth/ -H "Content-Type: application/json" -d '{"username":"PROP_NEXT","password":"PRopne##xt89"}'`, (err, stream) => {
    if (err) throw err;
    let authOut = '';
    stream.on('data', d => authOut += d.toString());
    stream.on('close', () => {
      const token = JSON.parse(authOut).data.token;
      const ts = Date.now().toString().slice(-6);
      
      // Try DID 07946350797 in ALL possible formats
      const didFormats = [
        '07946350797',      // with leading 0 (as user says)
        '7946350797',       // without leading 0 (10 digits)
        '917946350797',     // with 91 country code
        '+917946350797',    // with +91 country code
        '0917946350797',    // with 091 prefix
        '91 7946350797',    // with space
      ];
      
      const tryDid = (i) => {
        if (i >= didFormats.length) { conn.end(); return; }
        const did = didFormats[i];
        const callBody = JSON.stringify({
          autocallType: "5",
          destination: "8851860838",
          legACallerID: did,
          eventID: "pnx" + ts + i,
          voicebotProvider: "custom",
          voicebotURL: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
        });
        
        conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${callBody}' 2>&1`, (e, s) => {
          let out = '';
          s.on('data', d => out += d.toString());
          s.on('close', () => {
            console.log(`DID "${did}": ${out.trim()}`);
            tryDid(i + 1);
          });
        });
      };
      
      console.log('Testing DID 07946350797 in all formats...\n');
      tryDid(0);
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
