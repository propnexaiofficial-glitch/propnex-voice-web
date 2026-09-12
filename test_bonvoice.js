// Test Bonvoice authentication directly
const fetch = require('node-fetch');

const BONVOICE_API_URL = process.env.BONVOICE_BASE_URL || "https://backend.pbx.bonvoice.com";

async function testBonvoice() {
  console.log("=== Testing Bonvoice Authentication ===");
  try {
    const loginRes = await fetch(`${BONVOICE_API_URL}/usermanagement/external-auth/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        username: "PROP_NEXT",
        password: "PRopne##xt89",
      }),
    });

    const loginText = await loginRes.text();
    console.log("Status:", loginRes.status);
    console.log("Response:", loginText);

    if (!loginRes.ok) {
      console.log("❌ AUTH FAILED");
      return;
    }

    const loginData = JSON.parse(loginText);
    const token = loginData.token || loginData.access_token || loginData.data?.token || loginData.data?.access_token;
    
    if (!token) {
      console.log("❌ No token in response. Response keys:", Object.keys(loginData));
      return;
    }

    console.log("✅ Auth successful! Token:", token.substring(0, 20) + "...");

    // Now test making a call to 8851860838 from DID 07946350797
    console.log("\n=== Testing Click2Call ===");
    console.log("Calling 8851860838 from DID 07946350797");
    
    const callRes = await fetch(`${BONVOICE_API_URL}/click2call/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        source_number: "+917946350797",  // DID: 07946350797 
        destination_number: "8851860838",
        template_url: process.env.BONVOICE_VOICEBOT_URL || "wss://vineeth-inbound.onrender.com/ws/voice-agent",
        reference_id: "test-call-" + Date.now()
      }),
    });

    const callText = await callRes.text();
    console.log("Call Status:", callRes.status);
    console.log("Call Response:", callText);

    if (callRes.ok) {
      console.log("✅ Call initiated successfully!");
    } else {
      console.log("❌ Call failed");
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

testBonvoice();
