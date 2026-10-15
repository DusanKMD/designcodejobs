import crypto from "node:crypto";

type ServiceAccount = { client_email: string; private_key: string };

function b64url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function accessToken(account: ServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).sign(account.private_key);
  const assertion = `${unsigned}.${b64url(signature)}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new Error(`indexing token ${response.status}`);
  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("indexing token missing");
  return json.access_token;
}

/** URL_UPDATED when a job is published or edited. URL_DELETED when it closes. No-ops without credentials. */
export async function notifyIndexing(url: string, type: "URL_UPDATED" | "URL_DELETED") {
  const raw = process.env.GOOGLE_INDEXING_CREDENTIALS;
  if (!raw) return { skipped: true as const };
  try {
    const account = JSON.parse(raw) as ServiceAccount;
    const token = await accessToken(account);
    const response = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ url, type }),
    });
    return { skipped: false as const, ok: response.ok, status: response.status };
  } catch (error) {
    console.error("[indexing]", error);
    return { skipped: false as const, ok: false, status: 0 };
  }
}
