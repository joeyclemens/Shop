import { getStore } from "@netlify/blobs";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default async (req) => {
  // Optional passcode. Set APP_PASSCODE in Netlify to switch it on.
  const passcode = Netlify.env.get("APP_PASSCODE");
  if (passcode && req.headers.get("x-passcode") !== passcode) {
    return json({ error: "unauthorised" }, 401);
  }

  const store = getStore({ name: "weekly-shop", consistency: "strong" });
  const current = (await store.get("state", { type: "json" })) ?? { state: null, rev: 0 };

  if (req.method === "GET") {
    return json(current);
  }

  if (req.method === "PUT") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "bad json" }, 400);
    }
    const s = body && body.state;
    if (!s || !Array.isArray(s.sections) || !Array.isArray(s.meals)) {
      return json({ error: "bad state" }, 400);
    }
    if (JSON.stringify(s).length > 1_000_000) {
      return json({ error: "too large" }, 413);
    }
    // Someone else saved since this device last synced: hand back the newer copy.
    if (body.baseRev !== current.rev) {
      return json(current, 409);
    }
    const next = { state: s, rev: current.rev + 1 };
    await store.setJSON("state", next);
    return json({ rev: next.rev });
  }

  return json({ error: "method not allowed" }, 405);
};

export const config = { path: "/api/state" };
