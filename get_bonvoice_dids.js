const { Client } = require('ssh2');

// The DID 07946350797 is not assigned to the PROP_NEXT user.
// Let's get the list of available DIDs from Bonvoice for this user.

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`curl -s https://backend.pbx.bonvoice.com/usermanagement/external-auth/ -X POST -H "Content-Type: application/json" -d '{"username":"PROP_NEXT","password":"PRopne##xt89"}'`, (err, stream) => {
    if (err) throw err;
    let authOut = '';
    stream.on('data', d => authOut += d.toString());
    stream.on('close', () => {
      const token = JSON.parse(authOut).data.token;
      console.log('Token:', token.substring(0, 20) + '...');
      
      // Get assigned DIDs
      conn.exec(`curl -s https://backend.pbx.bonvoice.com/usermanagement/getassignednumbers/ -H "Authorization: Token ${token}" -H "Accept: application/json" 2>&1`, (e2, s2) => {
        if (e2) { conn.end(); return; }
        let out = '';
        s2.on('data', d => out += d.toString());
        s2.on('close', () => {
          console.log('Assigned Numbers:', out);
          
          // Also try to list user profile
          conn.exec(`curl -s https://backend.pbx.bonvoice.com/usermanagement/userprofile/ -H "Authorization: Token ${token}" -H "Accept: application/json" 2>&1`, (e3, s3) => {
            if (e3) { conn.end(); return; }
            let out3 = '';
            s3.on('data', d => out3 += d.toString());
            s3.on('close', () => {
              console.log('User Profile:', out3);
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({
  host: 'propnexai.com',
  port: 22,
  username: 'root',
  password: 'Propnexai@123'
});
