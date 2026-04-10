import { NextRequest, NextResponse } from "next/server";

function getAgentServiceUrl() {
  return process.env["AGENT_SERVICE_URL"] ?? "http://agent:8080";
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, language } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const agentServiceUrl = getAgentServiceUrl();

    // Forward to agent service
    const agentRes = await fetch(`${agentServiceUrl}/agent/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, language }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!agentRes.ok) {
      const detail = await agentRes.text();
      throw new Error(`Agent returned ${agentRes.status}: ${detail}`);
    }

    const data = await agentRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[Agent] Error:", err);
    return NextResponse.json(
      { error: "Agent request failed", detail: String(err) },
      { status: 502 }
    );
  }
}
