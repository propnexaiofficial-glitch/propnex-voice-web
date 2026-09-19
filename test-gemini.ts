import { PrismaClient } from '@prisma/client';
import { GEMINI_API_KEYS } from './src/lib/gemini-keys';

const prisma = new PrismaClient();

function toMinSec(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m} min ${s} sec` : `${s} sec`;
}

function dateFmt(d: any) {
  return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Unknown";
}
function timeFmt(d: any) {
  return d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Unknown";
}

function groupBy(arr: any[], key: (item: any) => string) {
  return arr.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, any[]>);
}

async function test() {
  try {
    // Assume companyId is the first one
    const company = await prisma.company.findFirst({
      include: { childCompanies: true, creditBalance: true, phoneNumbers: true }
    });
    if (!company) return console.log("No company");

    const companyId = company.id;
    const subcompanies = company.childCompanies || [];

    const rawCallLogs = await prisma.callLog.findMany({
      where: { companyId },
      select: {
        id: true,
        direction: true,
        status: true,
        durationSeconds: true,
        cost: true,
        creditsUsed: true,
        startedAt: true,
        phoneNumberId: true,
        recordingUrl: true,
        historicalDidString: true,
        campaignId: true,
        isRetry: true,
        retryNumber: true,
        disconnectReason: true,
        leadId: true,
      },
      orderBy: { startedAt: "desc" },
      take: 2000,
    });

    const subCompanyIds = subcompanies.map((s: any) => s.id);
    const subCallLogs = subCompanyIds.length > 0
      ? await prisma.callLog.findMany({
          where: { companyId: { in: subCompanyIds } },
          select: {
            id: true, companyId: true, direction: true, status: true,
            durationSeconds: true, cost: true, creditsUsed: true,
            startedAt: true, phoneNumberId: true, recordingUrl: true,
            campaignId: true, isRetry: true, leadId: true,
          },
          take: 1000,
        })
      : [];

    const allCalls = [...rawCallLogs, ...subCallLogs];
    const customerCallMap: Record<string, any> = {};

    for (const c of allCalls) {
      const lid = c.leadId;
      if (!lid) continue;
      if (!customerCallMap[lid]) {
        customerCallMap[lid] = { leadId: lid, inbound: 0, outbound: 0, totalDuration: 0, lastCall: c.startedAt, recordings: [] };
      }
      const entry = customerCallMap[lid];
      if (c.direction === "INBOUND") entry.inbound++;
      else entry.outbound++;
      entry.totalDuration += c.durationSeconds || 0;
      if (c.recordingUrl) entry.recordings.push(c.recordingUrl);
      if (new Date(c.startedAt) > new Date(entry.lastCall)) entry.lastCall = c.startedAt;
    }

    const customerList = Object.values(customerCallMap);
    const topByTotal   = [...customerList].sort((a, b) => (b.inbound + b.outbound) - (a.inbound + a.outbound)).slice(0, 50);
    const topInbound   = [...customerList].sort((a, b) => b.inbound  - a.inbound).slice(0, 10);
    const topOutbound  = [...customerList].sort((a, b) => b.outbound - a.outbound).slice(0, 10);

    const topLeadIds = new Set([...topByTotal, ...topInbound, ...topOutbound].map(c => c.leadId));
    const topLeads = await prisma.lead.findMany({
      where: { id: { in: Array.from(topLeadIds) } },
      select: { id: true, phone: true, firstName: true, lastName: true }
    });
    const leadDataMap = new Map(topLeads.map(l => [l.id, l]));

    const enrichCustomer = (c: any) => {
      const l = leadDataMap.get(c.leadId) as any;
      return { ...c, phone: l?.phone || "Unknown", name: `${l?.firstName || ""} ${l?.lastName || ""}`.trim() || "Unknown" };
    };

    const topByTotalEnriched = topByTotal.map(enrichCustomer);
    
    // BUILD CONTEXT
    const dateGroups = groupBy(allCalls, (c: any) => dateFmt(c.startedAt));
    const perDayLines = Object.keys(dateGroups).slice(0, 60).map(d => `${d}: ${dateGroups[d].length} calls`);

    let systemContext = `TOP 50 CUSTOMERS:\n` + topByTotalEnriched.map(c => `${c.phone}: ${c.inbound+c.outbound}`).join("\n");
    systemContext += `\nPER DAY:\n` + perDayLines.join("\n");

    console.log("System Context Length:", systemContext.length);

    const payload = {
      contents: [
        { role: "user", parts: [{ text: "Hello" }] }
      ],
      systemInstruction: { parts: [{ text: systemContext }] },
      generationConfig: { temperature: 0.1 }
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEYS[0]}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.log("GEMINI ERROR:", res.status, await res.text());
    } else {
      console.log("GEMINI SUCCESS");
    }

  } catch (e) {
    console.error("Crash:", e);
  }
}

test();
