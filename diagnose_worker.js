const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const redis = 'redis-cli -h 200.234.34.240 -p 6379 -a "Propnexai@123" --no-auth-warning';
  
  // Check the current state of the wait queue
  conn.exec(`${redis} LRANGE "bull:campaign-execution-queue:wait" 0 -1 2>&1`, (err, stream) => {
    if (err) throw err;
    let waitQ = '';
    stream.on('data', d => waitQ += d.toString());
    stream.on('close', () => {
      console.log('Wait queue:', waitQ);
      
      // Check if the worker is connected to the right queue name
      conn.exec(`${redis} KEYS "bull:campaign-execution*" 2>&1`, (e2, s2) => {
        let keys = '';
        s2.on('data', d => keys += d.toString());
        s2.on('close', () => {
          console.log('\nAll campaign queue keys:', keys);
          
          // The job was put in "bull:campaign-execution-queue:wait"
          // but the dist worker might be listening on "bull:campaign-execution-queue" vs other name
          // Let's check exactly what queue names are registered
          conn.exec(`${redis} KEYS "bull:*:wait" 2>&1`, (e3, s3) => {
            let waitKeys = '';
            s3.on('data', d => waitKeys += d.toString());
            s3.on('close', () => {
              console.log('\nAll wait queue keys:', waitKeys);
              
              // Check the stalled check key to see worker heartbeat
              conn.exec(`${redis} ZRANGE "bull:campaign-execution-queue:stalled-check" 0 -1 WITHSCORES 2>&1`, (e4, s4) => {
                let stalled = '';
                s4.on('data', d => stalled += d.toString());
                s4.on('close', () => {
                  console.log('\nStalled check (worker heartbeats):', stalled);
                  conn.end();
                });
              });
            });
          });
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
