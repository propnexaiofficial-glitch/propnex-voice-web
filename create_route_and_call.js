const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/usermanagement/external-auth/ -H "Content-Type: application/json" -d '{"username":"PROP_NEXT","password":"PRopne##xt89"}'`, (err, stream) => {
    if (err) throw err;
    let authOut = '';
    stream.on('data', d => authOut += d.toString());
    stream.on('close', () => {
      const token = JSON.parse(authOut).data.token;
      const timestamp = Date.now().toString().slice(-8);
      
      // Per the API docs, we need to first CREATE a voicebot route on the DID
      // POST /external-route-create/ with scope: "voicebot", did, provider_name, template_url
      // Let's create the route first
      console.log('Step 1: Creating voicebot route on DID 7946350798...');
      const routeBody = JSON.stringify({
        scope: "voicebot",
        did: "7946350798",
        provider_name: "propnexai",
        template_url: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
      });
      
      conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/external-route-create/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${routeBody}' 2>&1`, (e2, s2) => {
        let routeOut = '';
        s2.on('data', d => routeOut += d.toString());
        s2.on('close', () => {
          console.log('Route create response:', routeOut);
          
          // Now try the call with the registered provider name
          console.log('\nStep 2: Making call with registered provider...');
          const callBody = JSON.stringify({
            autocallType: "5",
            destination: "8851860838",
            legACallerID: "7946350798",
            eventID: "pnx" + timestamp,
            voicebotProvider: "propnexai",
            voicebotURL: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
          });
          
          conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${callBody}' 2>&1`, (e3, s3) => {
            let callOut = '';
            s3.on('data', d => callOut += d.toString());
            s3.on('close', () => {
              console.log('Call response:', callOut);
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
