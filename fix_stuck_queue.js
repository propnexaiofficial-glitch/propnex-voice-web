const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const redis = 'redis-cli -h 200.234.34.240 -p 6379 -a "Propnexai@123" --no-auth-warning';
  
  // 1. Check what's in the active queue
  conn.exec(`${redis} LRANGE "bull:campaign-execution-queue:active" 0 -1 2>&1`, (err, stream) => {
    if (err) throw err;
    let active = '';
    stream.on('data', d => active += d.toString());
    stream.on('close', () => {
      console.log('Active queue jobs:', active);
      
      // 2. Get the job data to understand what's stuck
      const jobId = active.trim().split('\n')[0]?.trim();
      if (!jobId) {
        console.log('No stuck jobs found');
        conn.end();
        return;
      }
      
      conn.exec(`${redis} HGETALL "bull:campaign-execution-queue:${jobId}" 2>&1`, (e2, s2) => {
        let jobData = '';
        s2.on('data', d => jobData += d.toString());
        s2.on('close', () => {
          console.log(`\nStuck job "${jobId}" data:`, jobData.substring(0, 500));
          
          // 3. Delete the lock so the job can be retried
          conn.exec(`${redis} DEL "bull:campaign-execution-queue:${jobId}:lock" 2>&1`, (e3, s3) => {
            let lockDel = '';
            s3.on('data', d => lockDel += d.toString());
            s3.on('close', () => {
              console.log(`\nDeleted lock for "${jobId}":`, lockDel.trim());
              
              // 4. Move job from active back to wait so it gets reprocessed
              conn.exec(`${redis} LMOVE "bull:campaign-execution-queue:active" "bull:campaign-execution-queue:wait" RIGHT LEFT 2>&1`, (e4, s4) => {
                let move = '';
                s4.on('data', d => move += d.toString());
                s4.on('close', () => {
                  console.log('\nMoved job to wait queue:', move.trim());
                  console.log('\n✅ Job unblocked! The worker should pick it up now.');
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
