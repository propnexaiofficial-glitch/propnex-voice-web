const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected. Deploying main server fix...');
  
  // The issue: git pull fails because /root/propnexai-main-server doesn't have git?
  // Let's check the git status first
  conn.exec('ls /root/propnexai-main-server/.git 2>&1 && echo "GIT_EXISTS"', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => { out += d.toString(); process.stdout.write(d.toString()); });
    stream.on('close', () => {
      if (out.includes('GIT_EXISTS')) {
        // Git exists, let's try the pull
        conn.exec('cd /root/propnexai-main-server && git status 2>&1 | head -10', (e2, s2) => {
          let o2 = '';
          s2.on('data', d => { o2 += d.toString(); process.stdout.write(d.toString()); });
          s2.on('close', () => {
            // Now try pull and rebuild
            conn.exec('cd /root/propnexai-main-server && git stash 2>&1 && git pull origin main 2>&1 | tail -5 && npm run build 2>&1 | tail -3 && pm2 restart propnexai-main-server && echo "DEPLOY_SUCCESS"', (e3, s3) => {
              s3.on('data', d => process.stdout.write(d.toString()));
              s3.stderr.on('data', d => process.stderr.write(d.toString()));
              s3.on('close', () => conn.end());
            });
          });
        });
      } else {
        console.log('\nNo git repo found. Let me check what is at /root...');
        conn.exec('ls /root/ 2>&1 && echo "---" && ls /root/propnexai-main-server/ 2>&1 | head -5', (e4, s4) => {
          s4.on('data', d => process.stdout.write(d.toString()));
          s4.on('close', () => conn.end());
        });
      }
    });
  });
}).connect({
  host: 'propnexai.com',
  port: 22,
  username: 'root',
  password: 'Propnexai@123'
});
