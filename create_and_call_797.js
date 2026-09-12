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
      
      // DID 7946350797 IS assigned (returns voicebot provider error, not DID error)
      // Now we need to figure out the correct provider name.
      // First: try creating a fresh voicebot route on this specific DID
      
      console.log('=== Creating voicebot route on DID 7946350797 ===');
      
      const providerNames = ['propnex', 'propnexai', 'PROP_NEXT', 'vineeth_bot', 'outbound_bot', 'pnx_bot'];
      
      const createAndTest = (i) => {
        if (i >= providerNames.length) { conn.end(); return; }
        const pname = providerNames[i];
        
        // Try creating route
        const routeBody = JSON.stringify({
          scope: "voicebot",
          did: "7946350797",
          provider_name: pname,
          template_url: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
        });
        
        conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/external-route-create/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${routeBody}' 2>&1`, (e2, s2) => {
          let routeOut = '';
          s2.on('data', d => routeOut += d.toString());
          s2.on('close', () => {
            console.log(`Create with provider "${pname}":`, routeOut.trim());
            
            // If route creation succeeded (status 1), try the call
            if (routeOut.includes('"status":"1"') || routeOut.includes('"status": "1"')) {
              console.log(`\n✅ Route created! Now making call with provider "${pname}"...`);
              
              const callBody = JSON.stringify({
                autocallType: "5",
                destination: "8851860838",
                legACallerID: "7946350797",
                eventID: "pnx" + ts,
                voicebotProvider: pname,
                voicebotURL: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
              });
              
              conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${callBody}' 2>&1`, (e3, s3) => {
                let callOut = '';
                s3.on('data', d => callOut += d.toString());
                s3.on('close', () => {
                  console.log('CALL RESPONSE:', callOut);
                  conn.end();
                });
              });
            } else {
              // Try the call anyway with this provider name to see if it works
              const callBody = JSON.stringify({
                autocallType: "5",
                destination: "8851860838",
                legACallerID: "7946350797",
                eventID: "pnx" + ts + i,
                voicebotProvider: pname,
                voicebotURL: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
              });
              
              conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${callBody}' 2>&1`, (e3, s3) => {
                let callOut = '';
                s3.on('data', d => callOut += d.toString());
                s3.on('close', () => {
                  console.log(`Call with "${pname}":`, callOut.trim());
                  createAndTest(i + 1);
                });
              });
            }
          });
        });
      };
      
      createAndTest(0);
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
