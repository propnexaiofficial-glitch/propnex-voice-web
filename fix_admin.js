const { Client } = require('ssh2');

const host = '200.234.34.240';
const username = 'root';
const password = 'Propnexai@123';

const conn = new Client();

const fixScript = `
echo "Fixing admin panel..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /root/propnexai-admin-panel
rm -rf .git
git init
git remote add origin https://github.com/propnexaiofficial-glitch/propnexai-admin-panel.git
git fetch --all
git reset --hard origin/main

echo "Installing dependencies..."
npm install --legacy-peer-deps
echo "Generating prisma..."
npx prisma generate
echo "Building..."
npm run build
echo "Restarting..."
pm2 restart propnex-admin-panel
echo "Done!"
`;

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(fixScript, (err, stream) => {
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
  readyTimeout: 60000
});
