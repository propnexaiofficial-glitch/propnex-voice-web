const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/usermanagement/external-auth/ -H "Content-Type: application/json" -d '{"username":"PROP_NEXT","password":"PRopne##xt89"}'`, (err, stream) => {
    if (err) throw err;
    let authOut = '';
    stream.on('data', d => authOut += d.toString());
    stream.on('close', () => {
      const token = JSON.parse(authOut).data.token;
      
      // The route on 7946350797 already exists. 
      // The "QuerySet" error happens because there might be MULTIPLE routes on this DID.
      // Let me check what routes exist for this specific DID by calling the route list
      // and look for any route with did_number containing 7946350797
      
      // Also try calling directly using autocallType "3" (click2call) which doesn't need voicebotProvider
      // This bridges Leg A (agent) to Leg B (customer)
      const ts = Date.now().toString().slice(-6);
      
      console.log('=== Trying Click2Call (autocallType 3) - no voicebotProvider needed ===');
      const callBody = JSON.stringify({
        autocallType: "3",
        destination: "8851860838",   // customer phone (Leg A - called first)
        ringStrategy: "ringall",
        legACallerID: "7946350797",
        legAChannelID: "1",
        legADialAttempts: "1",
        legBDestination: "7946350797",  // this will be the agent's number (Leg B)
        legBCallerID: "7946350797",
        legBChannelID: "1",
        legBDialAttempts: "1",
        eventID: "pnx" + ts
      });
      
      console.log('Payload:', callBody);
      
      conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${callBody}' 2>&1`, (e2, s2) => {
        let out = '';
        s2.on('data', d => out += d.toString());
        s2.on('close', () => {
          console.log('\nClick2Call Response:', out);
          
          // Also try a TTS call (autocallType 4) - no voicebotProvider needed either
          console.log('\n=== Trying TTS Call (autocallType 4) ===');
          const ttsBody = JSON.stringify({
            autocallType: "4",
            destination: "8851860838",
            legACallerID: "7946350797",
            speechContent: "Hello, this is a test call from PropNex AI. Your system is working perfectly.",
            speechLanguage: "ENGLISH",
            legADialAttempts: "1",
            eventID: "pnx" + ts + "t"
          });
          
          conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${ttsBody}' 2>&1`, (e3, s3) => {
            let out3 = '';
            s3.on('data', d => out3 += d.toString());
            s3.on('close', () => {
              console.log('TTS Response:', out3);
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
