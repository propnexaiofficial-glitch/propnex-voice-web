import jwt from "jsonwebtoken";

async function main() {
  const token = jwt.sign(
    { id: "6a8989f0ec40d7162bf7590c", sub: "6a8989f0ec40d7162bf7590c" },
    "propnex_secret_jwt_key_2026_key"
  );
  
  const res = await fetch("https://www.propnexai.com/api/calls/inbound", {
    headers: { "authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("API returned calls count:", data.data?.length);
  console.log(JSON.stringify(data.data?.map((c: any) => ({
    id: c.id,
    callLogId: c.callLogId,
    companyId: c.companyId
  })), null, 2));
}

main();
