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
      
      // Test TTS with 8851860838 - should still work
      const ttsBody = JSON.stringify({
        autocallType: "4",
        destination: "8851860838",
        legACallerID: "7946350797",
        speechContent: "Hello, this is a test call from PropNex AI. Please ignore.",
        speechLanguage: "ENGLISH",
        legADialAttempts: "1",
        eventID: "test" + ts
      });
      
      console.log('Testing TTS call to 8851860838 with DID 7946350797...');
      
      conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${ttsBody}' 2>&1`, (e2, s2) => {
        let out = '';
        s2.on('data', d => out += d.toString());
        s2.on('close', () => {
          console.log('TTS test result:', out);
          
          // Now check what the DID number in the campaign data is
          // Campaign job has didNumber: "07946350797" (with leading 0)
          // After cleanup: cleanDid = "7946350797" ✅
          // cleanDestination: "+917900063490" → remove non-digits → "917900063490" → last 10 → "7900063490"
          
          // Let's test with 7900063490 (not your number)
          const ttsBody2 = JSON.stringify({
            autocallType: "4",
            destination: "7900063490",  // The failing number
            legACallerID: "7946350797",
            speechContent: "Hello PropNex test.",
            speechLanguage: "ENGLISH",
            legADialAttempts: "1",
            eventID: "test2" + ts
          });
          
          console.log('\nTesting TTS with 7900063490...');
          conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/ -H "Content-Type: application/json" -H "Authorization: Token ${token}" -d '${ttsBody2}' 2>&1`, (e3, s3) => {
            let out3 = '';
            s3.on('data', d => out3 += d.toString());
            s3.on('close', () => {
              console.log('7900063490 result:', out3);
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
