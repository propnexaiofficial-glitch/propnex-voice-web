const { Client } = require('ssh2');

const conn = new Client();

const commands = [
  // Redis health
  'redis-cli -h 200.234.34.240 -a Propnexai@123 ping 2>&1',
  'redis-cli -h 200.234.34.240 -a Propnexai@123 info memory 2>&1 | grep used_memory_human',
  'redis-cli -h 200.234.34.240 -a Propnexai@123 info keyspace 2>&1',
  'redis-cli -h 200.234.34.240 -a Propnexai@123 keys "campaign-state:*" 2>&1',
  'redis-cli -h 200.234.34.240 -a Propnexai@123 keys "bull:*" 2>&1 | wc -l',
  // PM2 processes
  'pm2 list 2>&1',
  // Main server logs (last 30 lines)
  'pm2 logs propnexai-main-server --lines 30 --nostream 2>&1',
  // Check if BullMQ queue is healthy
  'redis-cli -h 200.234.34.240 -a Propnexai@123 llen "bull:campaign-execution-queue:wait" 2>&1',
  'redis-cli -h 200.234.34.240 -a Propnexai@123 llen "bull:campaign-execution-queue:active" 2>&1',
];

const fullCommand = commands.join(' && echo "---" && ');

conn.on('ready', () => {
  console.log('SSH Connected\n');
  conn.exec(fullCommand, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => { conn.end(); });
  });
}).connect({
  host: 'propnexai.com',
  port: 22,
  username: 'root',
  password: 'Propnexai@123'
});
