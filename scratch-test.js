const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function run() {
  let fileContent = fs.readFileSync('src/app/api/chatbot/route.ts', 'utf8');
  
  fileContent = fileContent.replace(
    /const mainIn = company\.phoneNumbers\.reduce[\s\S]*const outboundCalls = \{ length: mainOut \+ subOut, filter: \(fn: any\) => allCallsCombined\.filter\(c => c\.direction === "OUTBOUND"\)\.filter\(fn\) \};/g,
    `const mainIn = company.phoneNumbers.reduce((sum: number, p: any) => sum + callLogs.filter((c: any) => c.phoneNumberId === p.id && c.direction === "INBOUND").length, 0);
            const mainOut = company.phoneNumbers.reduce((sum: number, p: any) => sum + callLogs.filter((c: any) => c.phoneNumberId === p.id && c.direction === "OUTBOUND").length, 0);
            const subIn = subcompanies.reduce((sum: number, s: any) => sum + (s.phoneNumbers?.length > 0 ? s.phoneNumbers.reduce((sum2: number, p: any) => sum2 + subCallLogs.filter((c: any) => c.phoneNumberId === p.id && c.direction === "INBOUND").length, 0) : 0), 0);
            const subOut = subcompanies.reduce((sum: number, s: any) => sum + (s.phoneNumbers?.length > 0 ? s.phoneNumbers.reduce((sum2: number, p: any) => sum2 + subCallLogs.filter((c: any) => c.phoneNumberId === p.id && c.direction === "OUTBOUND").length, 0) : 0), 0);
            
            const inboundCalls = allCallsCombined.filter((c: any) => c.direction === "INBOUND");
            const outboundCalls = allCallsCombined.filter((c: any) => c.direction === "OUTBOUND");
            const combinedInboundLength = mainIn + subIn;
            const combinedOutboundLength = mainOut + subOut;`
  );

  fileContent = fileContent.replace(
    /Total Inbound Calls: \$\{inboundCalls\.length\} \(Failed: \$\{failedInbound\.length\}\)\\nTotal Outbound Calls: \$\{outboundCalls\.length\} \(Failed: \$\{failedOutbound\.length\}\)/g,
    `Total Inbound Calls: \$\{combinedInboundLength\} (Failed: \$\{failedInbound.length\})\\nTotal Outbound Calls: \$\{combinedOutboundLength\} (Failed: \$\{failedOutbound.length\})`
  );

  fs.writeFileSync('src/app/api/chatbot/route.ts', fileContent);
  console.log("Fixed route.ts arrays");
}

run().catch(console.error).finally(() => prisma.$disconnect());
