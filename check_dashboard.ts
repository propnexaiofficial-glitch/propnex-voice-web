
import { GET } from './src/app/api/reactivation/dashboard/route';
import { NextRequest } from 'next/server';

async function run() {
  const req = new NextRequest('http://localhost/api/reactivation/dashboard', {
    headers: { 'x-company-id': 'e84992dc-a764-460d-966a-2d2bc336338e' }
  });
  const res = await GET(req);
  const json = await res.json();
  const today = json.data[0];
  console.log(today.q2.status);
  console.log(today.q2.failedLeads.filter((l: any) => l.isAttempted).length);
}
run();

