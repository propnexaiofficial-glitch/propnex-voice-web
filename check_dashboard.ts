
import { GET } from './src/app/api/reactivation/dashboard/route';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

async function run() {
  const token = jwt.sign({ id: '6a8bed4d3f5b7c2eea48418e', sub: '6a8bed4d3f5b7c2eea48418e' }, 'propnex_secret_jwt_key_2026_key');
  const req = new NextRequest('http://localhost:3000/api/reactivation/dashboard', {
    headers: { authorization: 'Bearer ' + token }
  });
  const res = await GET(req);
  const data = await res.json();
  const bucket = data.data.find(b => b.id === '2026-09-19');
  console.log('Wave 1 Success Count:', bucket?.q1?.successCount);
  console.log('Wave 1 Failed Count:', bucket?.q1?.failedCount);
  console.log('Wave 1 Status:', bucket?.q1?.status);
  console.log('Wave 2 Leads:', bucket?.q2?.failedLeads?.length);
}
run();

