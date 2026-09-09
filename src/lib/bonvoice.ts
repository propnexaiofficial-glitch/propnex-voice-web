// src/lib/bonvoice.ts

export async function getBonvoiceToken() {
  const username = process.env.BONVOICE_USERNAME;
  const password = process.env.BONVOICE_PASSWORD;
  const baseUrl = process.env.BONVOICE_BASE_URL || "https://backend.pbx.bonvoice.com";

  if (!username || !password) {
    throw new Error("Missing Bonvoice credentials in environment variables");
  }

  // Bonvoice Authentication Token API
  const response = await fetch(`${baseUrl}/usermanagement/external-auth/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate with Bonvoice: ${response.statusText}`);
  }

  const data = await response.json();
  return data.token; // Adapt to exact Bonvoice token key if necessary
}
