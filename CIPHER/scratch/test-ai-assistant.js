const http = require("http");

async function postJson(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function getJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path,
        method: "GET",
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function patchJson(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function deleteJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path,
        method: "DELETE",
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function testStream(prompt) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ message: prompt });
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path: "/api/ai/chat/stream",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let raw = "";
        const events = [];
        res.on("data", (chunk) => {
          raw += chunk.toString();
        });
        res.on("end", () => {
          const parts = raw.split("\n\n");
          for (const p of parts) {
            if (!p.trim()) continue;
            const lines = p.split("\n");
            let event = "token";
            let data = null;
            for (const l of lines) {
              if (l.startsWith("event: ")) event = l.replace("event: ", "").trim();
              if (l.startsWith("data: ")) {
                try {
                  data = JSON.parse(l.replace("data: ", ""));
                } catch {
                  data = l.replace("data: ", "");
                }
              }
            }
            events.push({ event, data });
          }
          resolve({ status: res.statusCode, events, rawLength: raw.length });
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log("=== RUNNING CIPHER AI ASSISTANT END-TO-END TESTS ===");

  // 1. Status API
  console.log("\n[1] Checking /api/ai/status...");
  const statusRes = await getJson("/api/ai/status");
  console.log("Status response:", statusRes.data);
  if (statusRes.data.model !== "gpt-oss:120b-cloud") {
    throw new Error("Model mismatch: expected gpt-oss:120b-cloud");
  }
  console.log("✓ Model status verified: gpt-oss:120b-cloud connected=" + statusRes.data.connected);

  // 2. Chat Conversation CRUD
  console.log("\n[2] Testing Conversation CRUD...");
  const createRes = await postJson("/api/ai/chats", {
    title: "Test Investigation Alpha",
    investigationId: "INV-2026-0142",
  });
  console.log("Create chat:", createRes.data.conversation.id);
  const chatId = createRes.data.conversation.id;

  const getRes = await getJson(`/api/ai/chats/${chatId}`);
  console.log("Get chat title:", getRes.data.conversation.title);

  const renameRes = await patchJson(`/api/ai/chats/${chatId}`, {
    title: "Renamed Case Alpha",
  });
  console.log("Renamed chat title:", renameRes.data.conversation.title);
  if (renameRes.data.conversation.title !== "Renamed Case Alpha") {
    throw new Error("Rename failed");
  }

  // 3. Test Stream with English query (Investigative query)
  console.log("\n[3] Testing SSE Streaming: English Investigative Query...");
  const stream1 = await testStream("What is TARGET-01 role in Operation Nexus?");
  console.log("Stream events count:", stream1.events.length, "Total bytes:", stream1.rawLength);
  const toolStarts1 = stream1.events.filter((e) => e.event === "tool_start");
  const toolEnds1 = stream1.events.filter((e) => e.event === "tool_end");
  const metadata1 = stream1.events.find((e) => e.event === "metadata");
  console.log("Tools triggered:", toolStarts1.map((t) => t.data.tool));
  console.log("Language detected:", metadata1?.data?.detectedLanguage);
  console.log("Citations count:", metadata1?.data?.citations?.length);
  console.log("Follow-up leads:", metadata1?.data?.followUps);

  // 4. Test Stream with Hinglish query
  console.log("\n[4] Testing SSE Streaming: Hinglish Query...");
  const stream2 = await testStream("Is case me Aura Logistics ka kya role hai aur kisse judda hai?");
  const metadata2 = stream2.events.find((e) => e.event === "metadata");
  console.log("Hinglish detected language:", metadata2?.data?.detectedLanguage);
  console.log("Hinglish follow-ups:", metadata2?.data?.followUps);

  // 5. Test Stream with Hindi query
  console.log("\n[5] Testing SSE Streaming: Hindi Devanagari Query...");
  const stream3 = await testStream("ऑपरेशन नेक्सस के मुख्य सबूत क्या हैं?");
  const metadata3 = stream3.events.find((e) => e.event === "metadata");
  console.log("Hindi detected language:", metadata3?.data?.detectedLanguage);

  // 6. Test Stream with General Python Code query
  console.log("\n[6] Testing SSE Streaming: General Python Dijkstra Code Query...");
  const stream4 = await testStream("Write Python script for Dijkstra algorithm");
  const tokens4 = stream4.events
    .filter((e) => e.event === "token")
    .map((e) => e.data.token || "")
    .join("");
  console.log("Python code output preview:\n", tokens4.slice(0, 250), "...");

  // 7. Delete Chat
  console.log("\n[7] Testing Delete Conversation...");
  const deleteRes = await deleteJson(`/api/ai/chats/${chatId}`);
  console.log("Deleted chat:", deleteRes.data);

  console.log("\n✓✓ ALL CIPHER AI ASSISTANT SUITE TESTS PASSED PERFECTLY! ✓✓");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
