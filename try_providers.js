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
      
      // The route already exists (inbound). 
      // For Voicebot API (autocallType 5), the voicebotProvider must match 
      // what's already configured in Bonvoice for this DID.
      // The route list shows did_number: 7946350798, destination: VOICEBOT
      // Let's try different provider name variants
      
      const providers = ['VOICEBOT', 'voicebot', 'BOT', 'custom', 'propnexai', 'vineeth', 'agent'];
      
      const tryProvider = (i) => {
        if (i >= providers.length) { conn.end(); return; }
        const provider = providers[i];
        const callBody = JSON.stringify({
          autocallType: "5",
          destination: "8851860838",
          legACallerID: "7946350798",
          eventID: "pnx" + timestamp + i,
          voicebotProvider: provider,
          voicebotURL: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
        });
        
        conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${callBody}' 2>&1`, (e, s) => {
          let out = '';
          s.on('data', d => out += d.toString());
          s.on('close', () => {
            console.log(`Provider "${provider}": ${out.trim()}`);
            if (out.includes('"responseCode":200')) {
              console.log(`\n✅ SUCCESS with provider: ${provider}`);
            }
            tryProvider(i + 1);
          });
        });
      };
      
      tryProvider(0);
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
