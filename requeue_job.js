const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const redis = 'redis-cli -h 200.234.34.240 -p 6379 -a "Propnexai@123" --no-auth-warning';
  
  // The job is in stalled queue. 
  // Step 1: Remove from stalled
  conn.exec(`${redis} LRANGE "bull:campaign-execution-queue:stalled" 0 -1 2>&1`, (err, stream) => {
    if (err) throw err;
    let stalled = '';
    stream.on('data', d => stalled += d.toString());
    stream.on('close', () => {
      console.log('Stalled jobs:', stalled);
      
      // Step 2: Also check active queue  
      conn.exec(`${redis} LRANGE "bull:campaign-execution-queue:active" 0 -1 2>&1`, (e2, s2) => {
        let active = '';
        s2.on('data', d => active += d.toString());
        s2.on('close', () => {
          console.log('Active jobs:', active);
          
          const jobId = 'campaign-6a8bed4d3f5b7c2eea48418e-1789112536345';
          
          // Step 3: Completely clean up this stuck job
          // Remove from active, stalled, delete lock
          const cleanCmds = [
            `${redis} LREM "bull:campaign-execution-queue:active" 0 "${jobId}"`,
            `${redis} LREM "bull:campaign-execution-queue:stalled" 0 "${jobId}"`, 
            `${redis} DEL "bull:campaign-execution-queue:${jobId}:lock"`,
          ];
          
          let i = 0;
          const runNext = () => {
            if (i >= cleanCmds.length) {
              // Step 4: Now push a fresh job directly to the wait list
              // First check what the job data was
              conn.exec(`${redis} HGET "bull:campaign-execution-queue:${jobId}" "data" 2>&1`, (ejd, sjd) => {
                let jobData = '';
                sjd.on('data', d => jobData += d.toString());
                sjd.on('close', () => {
                  console.log('\nJob data:', jobData.substring(0, 200));
                  
                  // Push fresh to wait (using LPUSH for priority)
                  conn.exec(`${redis} LPUSH "bull:campaign-execution-queue:wait" "${jobId}" 2>&1`, (ep, sp) => {
                    let push = '';
                    sp.on('data', d => push += d.toString());
                    sp.on('close', () => {
                      console.log('\nPushed to wait queue:', push.trim());
                      
                      // Verify
                      conn.exec(`${redis} LRANGE "bull:campaign-execution-queue:wait" 0 -1 2>&1`, (ev, sv) => {
                        let verify = '';
                        sv.on('data', d => verify += d.toString());
                        sv.on('close', () => {
                          console.log('Wait queue now:', verify);
                          console.log('\n✅ Job re-queued! Worker should pick it up within 5 seconds.');
                          conn.end();
                        });
                      });
                    });
                  });
                });
              });
              return;
            }
            
            conn.exec(cleanCmds[i++], (ec, sc) => {
              let res = '';
              sc.on('data', d => res += d.toString());
              sc.on('close', () => {
                console.log(`Cleanup step ${i}: ${res.trim()}`);
                runNext();
              });
            });
          };
          
          console.log('\nCleaning up stuck job...');
          runNext();
        });
      });
    });
  });
}).connect({ host: 'propnexai.com', port: 22, username: 'root', password: 'Propnexai@123' });
