const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  // Get auth token first
  conn.exec(`curl -s -X POST https://backend.pbx.bonvoice.com/usermanagement/external-auth/ -H "Content-Type: application/json" -d '{"username":"PROP_NEXT","password":"PRopne##xt89"}'`, (err, stream) => {
    if (err) throw err;
    let authOut = '';
    stream.on('data', d => authOut += d.toString());
    stream.on('close', () => {
      const token = JSON.parse(authOut).data.token;
      
      // Try various Bonvoice endpoints to find DIDs
      const endpoints = [
        '/didManagement/',
        '/didManagement/list/',
        '/didManagement/dids/',
        '/usermanagement/assignednumbers/',
        '/pbx/dids/',
        '/telephony/dids/',
        '/numbers/',
        '/autoDialManagement/',
        '/autoDialManagement/list/',
        '/usermanagement/extensions/',
      ];
      
      let i = 0;
      const tryNext = () => {
        if (i >= endpoints.length) { conn.end(); return; }
        const ep = endpoints[i++];
        conn.exec(`curl -s -o /dev/null -w "${ep}: %{http_code}\\n" https://backend.pbx.bonvoice.com${ep} -H "Authorization: Token ${token}" -H "Accept: application/json"`, (e, s) => {
          if (e) { tryNext(); return; }
          s.on('data', d => process.stdout.write(d.toString()));
          s.on('close', tryNext);
        });
      };
      tryNext();
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
