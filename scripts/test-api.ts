import { GET } from "../src/app/api/calls/inbound/route";
import jwt from "jsonwebtoken";

async function main() {
  const token = jwt.sign(
    { id: "6a88ff9f2df9cd3bdcb0e6de", sub: "6a88ff9f2df9cd3bdcb0e6de" }, // Parent company admin
    "propnex_secret_jwt_key_2026_key"
  );
  
  const req = {
    headers: new Map([["authorization", `Bearer ${token}`]]),
    url: "http://localhost/api/calls/inbound?page=1&limit=10"
  } as any;
  
  const res = await GET(req);
  const data = await res.json();
  const calls = data.data;
  console.log("API returned calls count:", calls.length);
  console.log(JSON.stringify(calls, null, 2));
}

main();
