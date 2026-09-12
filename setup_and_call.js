const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/usermanagement/external-auth/ -H "Content-Type: application/json" -d '{"username":"PROP_NEXT","password":"PRopne##xt89"}'`, (err, stream) => {
    if (err) throw err;
    let authOut = '';
    stream.on('data', d => authOut += d.toString());
    stream.on('close', () => {
      const token = JSON.parse(authOut).data.token;
      
      // 1. Get all routes to see what's currently configured
      conn.exec(`curl -s https://backend.pbx.bonvoice.com/external-route-list/ -H "Authorization: Token ${token}" -H "Accept: application/json" 2>&1`, (e2, s2) => {
        let routes = '';
        s2.on('data', d => routes += d.toString());
        s2.on('close', () => {
          console.log('Current routes:', JSON.stringify(JSON.parse(routes), null, 2));
          
          // 2. Try creating voicebot route for a specific DID with outbound scope
          // Try using did 7946350796 which currently has description "EXTENSION"
          const routeBody = JSON.stringify({
            scope: "voicebot",
            did: "7946350796",  
            provider_name: "propnexai_bot",
            template_url: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
          });
          
          conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/external-route-create/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${routeBody}' 2>&1`, (e3, s3) => {
            let routeOut = '';
            s3.on('data', d => routeOut += d.toString());
            s3.on('close', () => {
              console.log('\nCreate voicebot route for 7946350796:', routeOut);
              
              // 3. Try the call using the new provider name
              const timestamp = Date.now().toString().slice(-8);
              const callBody = JSON.stringify({
                autocallType: "5",
                destination: "8851860838",
                legACallerID: "7946350796",
                eventID: "pnx" + timestamp,
                voicebotProvider: "propnexai_bot",
                voicebotURL: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
              });
              
              conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${callBody}' 2>&1`, (e4, s4) => {
                let callOut = '';
                s4.on('data', d => callOut += d.toString());
                s4.on('close', () => {
                  console.log('\n=== CALL WITH NEW ROUTE ===');
                  console.log(callOut);
                  conn.end();
                });
              });
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
