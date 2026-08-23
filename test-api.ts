import { NextRequest } from "next/server";
import { GET } from "../src/app/api/calls/inbound/route";
import jwt from "jsonwebtoken";

async function testApi() {
  const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";
  const token = jwt.sign({ sub: "6a89505c6d37df98e27c00de", id: "6a89505c6d37df98e27c00de" }, JWT_SECRET); // Assuming admin or user id here, wait I need satish's user ID.
  
  // Actually let's just make a mock NextRequest
}
