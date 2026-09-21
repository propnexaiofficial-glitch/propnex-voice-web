
async function run() {
  const res = await fetch('http://localhost:3000/api/reactivation/dashboard', {
    headers: { 'x-company-id': '6a8bed4d3f5b7c2eea48418e' }
  });
  const json = await res.json();
  const today = json.data[0];
  console.log('Q2 Status:', today.q2.status);
  console.log('Q2 Attempted:', today.q2.failedLeads.filter((l: any) => l.isAttempted).length);
  console.log('Q2 Completed:', today.q2.failedLeads.filter((l: any) => l.isCompleted).length);
}
run();

