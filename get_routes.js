const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/usermanagement/external-auth/ -H "Content-Type: application/json" -d '{"username":"PROP_NEXT","password":"PRopne##xt89"}'`, (err, stream) => {
    if (err) throw err;
    let authOut = '';
    stream.on('data', d => authOut += d.toString());
    stream.on('close', () => {
      const token = JSON.parse(authOut).data.token;
      // Check route list - this shows DIDs configured on the account
      conn.exec(`curl -s https://backend.pbx.bonvoice.com/external-route-list/ -H "Authorization: Token ${token}" -H "Accept: application/json" 2>&1`, (e2, s2) => {
        let out = '';
        s2.on('data', d => out += d.toString());
        s2.on('close', () => {
          console.log('=== ROUTE LIST (shows configured DIDs) ===');
          console.log(out);
          conn.end();
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
