const http = require("http");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runSuite() {
  console.log("==================================================");
  console.log("CIPHER INVESTIGATION & CLUE SYSTEM VERIFICATION SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify Case-Scoped Graphs for all 5 investigations
    console.log("\n--- TEST 1: Case-Scoped Graphs ---");
    const cases = [
      { id: "INV-2026-0142", expectedNode: "target-01" },
      { id: "CYB-2026-0481", expectedNode: "cyber-01" },
      { id: "FIN-2026-0819", expectedNode: "fin-broker" },
      { id: "TRF-2026-0231", expectedNode: "trf-driver" },
      { id: "INV-2025-089", expectedNode: "blue-ship" },
    ];

    for (const c of cases) {
      const res = await request(`/api/investigations/${c.id}/graph`);
      assert(res.status === 200 && res.body.success === true, `Graph endpoint returns 200 for ${c.id}`);
      assert(
        Array.isArray(res.body.nodes) && res.body.nodes.some((n) => n.id === c.expectedNode),
        `Graph for ${c.id} contains distinctive case node '${c.expectedNode}'`
      );
    }

    // 2. Verify Geospatial Intelligence API for all cases
    console.log("\n--- TEST 2: Geospatial Case-Scoped Waypoints ---");
    for (const c of cases) {
      const res = await request(`/api/investigations/${c.id}/geospatial`);
      assert(res.status === 200 && res.body.success === true, `Geospatial endpoint returns 200 for ${c.id}`);
      assert(
        Array.isArray(res.body.data.waypoints) && res.body.data.waypoints.length > 0,
        `Geospatial data for ${c.id} contains ${res.body.data.waypoints?.length} tactical waypoints`
      );
    }

    // 3. Test Clue Node Lifecycle: Create -> Connect -> Update -> Delete
    console.log("\n--- TEST 3: Investigator Clue Lifecycle & Audit Logging ---");
    const testCaseId = "INV-2026-0142";
    const createRes = await request(`/api/investigations/${testCaseId}/clues`, {
      method: "POST",
      body: {
        title: "Test Informant Lead #99",
        clueObservation: "Informant stated Viktor R. scheduled emergency meetup at Berth 42.",
        source: "Confidential Informant T-9",
        priority: "CRITICAL",
        nodeType: "evidence",
        confidence: "High (Verified)",
        positionX: 490,
        positionY: 275,
      },
    });

    assert(createRes.status === 200 && createRes.body.success === true, "Successfully created manual clue node");
    const clueId = createRes.body.clueNode?.id;
    assert(Boolean(clueId), `Created clue ID: ${clueId}`);

    // Connect Clue to target-01
    const connectRes = await request(`/api/investigations/${testCaseId}/clues/${clueId}/connect`, {
      method: "POST",
      body: {
        targetId: "target-01",
        relationshipType: "POTENTIAL_ASSOCIATION",
        notes: "Informant overheard target discussing secret meeting.",
      },
    });
    assert(connectRes.status === 200 && connectRes.body.success === true, "Connected clue to TARGET-01 with hypothesis edge");

    // Update Clue
    const updateRes = await request(`/api/investigations/${testCaseId}/clues/${clueId}`, {
      method: "PATCH",
      body: {
        title: "Updated Informant Lead #99",
        clueObservation: "Updated: Meetup corroborated by harbor terminal logs.",
        priority: "CRITICAL",
      },
    });
    assert(updateRes.status === 200 && updateRes.body.success === true, "Successfully updated clue details");

    // Persist Node Position
    const posRes = await request(`/api/investigations/${testCaseId}/positions`, {
      method: "PATCH",
      body: {
        positions: {
          [clueId]: { x: 530, y: 310 },
        },
      },
    });
    assert(posRes.status === 200 && posRes.body.success === true, "Successfully persisted custom node positions");

    // Delete Clue
    const deleteRes = await request(`/api/investigations/${testCaseId}/clues/${clueId}`, {
      method: "DELETE",
    });
    assert(deleteRes.status === 200 && deleteRes.body.success === true, "Successfully deleted manual clue node and its edges");

    // 4. Test AI Chat Stream for Intelligence Analysis
    console.log("\n--- TEST 4: AI Stream with Structured Intelligence Analysis ---");
    const aiStreamRes = await request(`/api/ai/chat/stream`, {
      method: "POST",
      body: {
        message: "Analyze intelligence bulletin 'Customs Intercepts Suspicious Freight at Rotterdam Berth 42' for active case INV-2026-0142",
        conversationId: "test-stream-conv-" + Date.now(),
        investigationId: "INV-2026-0142",
      },
    });
    assert(aiStreamRes.status === 200, "AI Chat streaming endpoint returned HTTP 200");
    const rawOutput = typeof aiStreamRes.raw === "string" ? aiStreamRes.raw : JSON.stringify(aiStreamRes.body);
    assert(rawOutput.includes("event: token"), "AI Chat stream produced token events");
    assert(
      rawOutput.includes("Potential Connection") ||
      rawOutput.includes("Investigative Lead") ||
      rawOutput.includes("Requires Human Verification") ||
      rawOutput.includes("TARGET-01"),
      "AI analysis output contains cautious investigative language and case grounding"
    );

    console.log("\n==================================================");
    console.log(`FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runSuite();
