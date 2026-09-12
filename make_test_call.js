const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/usermanagement/external-auth/ -H "Content-Type: application/json" -d '{"username":"PROP_NEXT","password":"PRopne##xt89"}'`, (err, stream) => {
    if (err) throw err;
    let authOut = '';
    stream.on('data', d => authOut += d.toString());
    stream.on('close', () => {
      const token = JSON.parse(authOut).data.token;
      
      // Use DID 7946350798 which IS assigned to PROP_NEXT
      const timestamp = Date.now().toString().slice(-8); // 8 chars for eventID
      const callBody = JSON.stringify({
        autocallType: "5",
        destination: "8851860838",
        legACallerID: "7946350798",
        eventID: "pnx" + timestamp,
        voicebotProvider: "custom",
        voicebotURL: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
      });
      
      console.log('Calling 8851860838 from DID 7946350798...');
      console.log('Payload:', callBody);
      
      conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${callBody}' 2>&1`, (e2, s2) => {
        let out = '';
        s2.on('data', d => out += d.toString());
        s2.on('close', () => {
          console.log('\n=== CALL RESPONSE ===');
          console.log(out);
          conn.end();
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
