const { Client } = require('ssh2');

const host = '200.234.34.240';
const username = 'root';
const password = 'Propnexai@123';

const conn = new Client();

const deployScript = `
echo "Starting deployment..."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "=== DEPLOYING ADMIN PANEL ==="
cd /root/propnexai-admin-panel
git pull origin main
npm install --legacy-peer-deps
npx prisma generate
npm run build
pm2 restart propnexai-admin || pm2 restart all

echo "=== DEPLOYING MAIN SERVER ==="
cd /root/propnexai-main-server
git pull origin main
npm install --legacy-peer-deps
npx prisma generate
npm run build
pm2 restart propnex-main-server || pm2 restart all

echo "=== DEPLOYING VOICE WEB (WEBSITE) ==="
cd /root/propnex-voice-web
git pull origin main
npm install --legacy-peer-deps
npx prisma generate
npm run build
pm2 restart propnex-voice-web || pm2 restart all

echo "Deployment finished! PM2 Status:"
pm2 list
`;

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(deployScript, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: host,
  port: 22,
  username: username,
  password: password,
  readyTimeout: 60000 // 60 seconds
});
