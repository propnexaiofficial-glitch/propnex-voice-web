import { POST } from "../src/app/api/webhooks/bonvoice/notification/route";

async function test() {
  const req = {
    headers: { get: () => 'application/json' },
    json: async () => ({
      Status: 'Ringing',
      SourceNumber: '1111111111',
      DestinationNumber: '07946350796',
      callID: 'test-local-1111',
      Direction: 'Inbound',
      StartTime: new Date().toISOString()
    })
  };
  try {
    const res = await POST(req as any);
    console.log('Local Response:', await res.json());
  } catch (err) {
    console.error('Local Error:', err);
  }
}
test();
