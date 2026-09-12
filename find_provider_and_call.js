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
      
      // DID 7946350797 IS assigned. Try every possible provider name variation
      const providers = [
        'BOT', 'EXTENSION', 'INCOMING',        // from route list descriptions
        'Voicebot', 'VoiceBot', 'VOICEBOT',     // common
        'outbound', 'OUTBOUND', 'Outbound',     // outbound variants
        'vineeth', 'Vineeth', 'VINEETH',         // from voicebot URL
        'propnex', 'PropNex', 'PROPNEX',
        'agent', 'AGENT', 'Agent',
        'bot', 'Bot',
        'voiceagent', 'VoiceAgent', 'voice_agent',
        'pnx', 'PNX',
        '',                                      // empty string
      ];
      
      let found = false;
      const tryProvider = (i) => {
        if (i >= providers.length || found) { 
          if (!found) console.log('\n❌ None worked. Need to check Bonvoice admin portal.');
          conn.end(); 
          return; 
        }
        const p = providers[i];
        const callBody = JSON.stringify({
          autocallType: "5",
          destination: "8851860838",
          legACallerID: "7946350797",
          eventID: "pnx" + ts + i,
          voicebotProvider: p,
          voicebotURL: "wss://vineeth-inbound.onrender.com/ws/voice-agent"
        });
        
        conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${callBody}' 2>&1`, (e, s) => {
          let out = '';
          s.on('data', d => out += d.toString());
          s.on('close', () => {
            const resp = out.trim();
            console.log(`Provider "${p}": ${resp}`);
            if (resp.includes('responseCode') || (!resp.includes('error') && !resp.includes('not found'))) {
              console.log(`\n✅✅✅ CALL INITIATED! Provider: "${p}"`);
              found = true;
            }
            tryProvider(i + 1);
          });
        });
      };
      
      console.log('DID: 7946350797 → Calling 8851860838\n');
      tryProvider(0);
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
