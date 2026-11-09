const http = require("http");

async function loginAndGetCookie() {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      identifier: "analyst.sharma@cipher.intel",
      password: "cipher-classified-pass",
    });

    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path: "/api/auth/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        const cookies = res.headers["set-cookie"];
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (cookies && cookies.length > 0) {
            const sessionCookie = cookies
              .map((c) => c.split(";")[0])
              .join("; ");
            resolve({ sessionCookie, data: JSON.parse(body) });
          } else {
            reject(new Error("No cookie returned: " + body));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function fetchPage(path, cookie) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path,
        method: "GET",
        headers: {
          Cookie: cookie,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode, html: body });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function run() {
  console.log("=== CIPHER GLOBAL SUB-DETAIL / DESCRIPTIVE TEXT REMOVAL TEST ===");

  const auth = await loginAndGetCookie();
  console.log("✓ Authenticated as:", auth.data.user.name);

  // 1. Check Operational Portal (/dashboard)
  console.log("\n[1] Checking Operational Portal (/dashboard)...");
  const dashboard = await fetchPage("/dashboard", auth.sessionCookie);
  if (dashboard.status !== 200) {
    throw new Error(`/dashboard returned status ${dashboard.status}`);
  }

  // Verify removed subtitles
  const removedSubtitles = [
    "ACTIVE CASE DOSSIERS",
    "DOSSIER INITIATION",
    "RESOLVED ACTORS & ASSETS",
    "INGESTION & PARSING",
    "CHRONOLOGICAL FORENSICS",
    "TACTICAL MAPPING",
    "ANOMALIES & THREATS",
    "NEURAL INVESTIGATIVE CORE",
    "JUDICIAL DOSSIER EXPORT",
    "CONFIGURATION & AUDIT",
    "Open ongoing investigations, review multi-agency case files",
    "Launch a new criminal or counter-intelligence case. Configure investigative classification",
    "Explore criminal relationship graphs, community clusters",
    "Select an operational intelligence module to access active dossiers",
  ];

  for (const sub of removedSubtitles) {
    if (dashboard.html.includes(sub)) {
      throw new Error(`Found unexpected subtitle/description in /dashboard: "${sub}"`);
    }
  }
  console.log("✓ All 14 decorative subtitles and description paragraphs confirmed REMOVED from /dashboard.");

  // Verify preserved operational data
  const preservedElements = [
    "OPERATIONAL",
    "PORTAL",
    "CIPHER OPERATIONAL PORTAL // SECURITY LEVEL 3",
    "Active Cases",
    "Tracked Entities",
    "High Priority",
    "Intelligence Command Modules",
    "Investigations",
    "New Investigation",
    "Network Analysis",
    "Entities Directory",
    "Data Sources",
    "Evidence Vault",
    "VIEW INVESTIGATIONS",
    "CREATE NEW CASE",
    "OPEN GRAPH ANALYSIS",
  ];

  for (const elem of preservedElements) {
    if (!dashboard.html.includes(elem)) {
      throw new Error(`Missing expected operational element in /dashboard: "${elem}"`);
    }
  }
  console.log("✓ All operational metrics, card titles, badges, and CTA buttons confirmed PRESERVED on /dashboard.");

  // 2. Check Deep Modules (/modules)
  console.log("\n[2] Checking Deep Modules (/modules)...");
  const modulesPage = await fetchPage("/modules", auth.sessionCookie);
  if (modulesPage.status !== 200) throw new Error(`/modules returned ${modulesPage.status}`);
  const removedFromModules = [
    "Accelerate complex cyber-threat diagnostics, entity resolution",
    "Dedicated operational interfaces linked to current dossier",
    "Multi-hop relationship mapping, transactional graph clustering",
  ];
  for (const s of removedFromModules) {
    if (modulesPage.html.includes(s)) {
      throw new Error(`Found unexpected description in /modules: "${s}"`);
    }
  }
  console.log("✓ Explanatory paragraphs confirmed REMOVED from /modules.");

  // 3. Check Investigations (/investigations)
  console.log("\n[3] Checking Investigations (/investigations)...");
  const invPage = await fetchPage("/investigations", auth.sessionCookie);
  if (invPage.status !== 200) throw new Error(`/investigations returned ${invPage.status}`);
  if (invPage.html.includes("Active criminal investigations, intelligence leads, and multi-agency")) {
    throw new Error("Found intro paragraph in /investigations!");
  }
  console.log("✓ Explanatory intro confirmed REMOVED from /investigations.");

  // 4. Check Network Analysis (/network-analysis)
  console.log("\n[4] Checking Network Analysis (/network-analysis)...");
  const netPage = await fetchPage("/network-analysis", auth.sessionCookie);
  if (netPage.status !== 200) throw new Error(`/network-analysis returned ${netPage.status}`);
  if (netPage.html.includes("Multi-hop relationship mapping • Target cluster isolation")) {
    throw new Error("Found subtext in /network-analysis!");
  }
  console.log("✓ Sub-detail text confirmed REMOVED from /network-analysis.");

  // 5. Check Entities (/entities)
  console.log("\n[5] Checking Entities (/entities)...");
  const entPage = await fetchPage("/entities", auth.sessionCookie);
  if (entPage.status !== 200) throw new Error(`/entities returned ${entPage.status}`);
  if (entPage.html.includes("Multi-source entity resolution • Relevant threat actors")) {
    throw new Error("Found intro paragraph in /entities!");
  }
  console.log("✓ Explanatory intro confirmed REMOVED from /entities.");

  // 6. Check Data Sources (/data-sources)
  console.log("\n[6] Checking Data Sources (/data-sources)...");
  const dsPage = await fetchPage("/data-sources", auth.sessionCookie);
  if (dsPage.status !== 200) throw new Error(`/data-sources returned ${dsPage.status}`);
  if (dsPage.html.includes("Multi-source data pipelines • Air-gapped parsing")) {
    throw new Error("Found intro paragraph in /data-sources!");
  }
  console.log("✓ Explanatory intro confirmed REMOVED from /data-sources.");

  // 7. Check Evidence (/evidence)
  console.log("\n[7] Checking Evidence (/evidence)...");
  const evPage = await fetchPage("/evidence", auth.sessionCookie);
  if (evPage.status !== 200) throw new Error(`/evidence returned ${evPage.status}`);
  if (evPage.html.includes("Cryptographic chain of custody • Immutable SHA-256 digital forensic")) {
    throw new Error("Found intro paragraph in /evidence!");
  }
  console.log("✓ Explanatory intro confirmed REMOVED from /evidence.");

  // 8. Check Alerts (/alerts)
  console.log("\n[8] Checking Alerts (/alerts)...");
  const alPage = await fetchPage("/alerts", auth.sessionCookie);
  if (alPage.status !== 200) throw new Error(`/alerts returned ${alPage.status}`);
  if (alPage.html.includes("Automated anomaly recognition • Bridge entity alerts")) {
    throw new Error("Found intro paragraph in /alerts!");
  }
  console.log("✓ Explanatory intro confirmed REMOVED from /alerts.");

  // 9. Check News AI (/news-ai)
  console.log("\n[9] Checking News AI (/news-ai)...");
  const newsPage = await fetchPage("/news-ai", auth.sessionCookie);
  if (newsPage.status !== 200) throw new Error(`/news-ai returned ${newsPage.status}`);
  if (newsPage.html.includes("Open-source intelligence correlation • Maritime security feeds")) {
    throw new Error("Found subtext in /news-ai!");
  }
  console.log("✓ Explanatory subtext confirmed REMOVED from /news-ai.");

  // 10. Check Reports (/reports)
  console.log("\n[10] Checking Reports (/reports)...");
  const repPage = await fetchPage("/reports", auth.sessionCookie);
  if (repPage.status !== 200) throw new Error(`/reports returned ${repPage.status}`);
  if (repPage.html.includes("Automated judicial case briefings • Multi-format intelligence")) {
    throw new Error("Found intro paragraph in /reports!");
  }
  console.log("✓ Explanatory intro confirmed REMOVED from /reports.");

  // 11. Check Timeline (/timeline)
  console.log("\n[11] Checking Timeline (/timeline)...");
  const timePage = await fetchPage("/timeline", auth.sessionCookie);
  if (timePage.status !== 200) throw new Error(`/timeline returned ${timePage.status}`);
  if (timePage.html.includes("Cross-entity chronological sequencing correlating calls")) {
    throw new Error("Found intro paragraph in /timeline!");
  }
  console.log("✓ Explanatory intro confirmed REMOVED from /timeline.");

  // 12. Check Settings (/settings)
  console.log("\n[12] Checking Settings (/settings)...");
  const setPage = await fetchPage("/settings", auth.sessionCookie);
  if (setPage.status !== 200) throw new Error(`/settings returned ${setPage.status}`);
  if (setPage.html.includes("Analyst credentials • Node clearance • Air-gapped network")) {
    throw new Error("Found intro paragraph in /settings!");
  }
  console.log("✓ Explanatory intro confirmed REMOVED from /settings.");

  // 13. Check Search (/search)
  console.log("\n[13] Checking Search (/search)...");
  const searchPage = await fetchPage("/search", auth.sessionCookie);
  if (searchPage.status !== 200) throw new Error(`/search returned ${searchPage.status}`);
  if (searchPage.html.includes("Federated forensic search across people, telephone intercepts")) {
    throw new Error("Found intro paragraph in /search!");
  }
  console.log("✓ Explanatory intro confirmed REMOVED from /search.");

  // 14. Check AI Assistant (/ai-assistant)
  console.log("\n[14] Checking AI Assistant (/ai-assistant)...");
  const aiPage = await fetchPage("/ai-assistant", auth.sessionCookie);
  if (aiPage.status !== 200) throw new Error(`/ai-assistant returned ${aiPage.status}`);
  if (aiPage.html.includes("General-purpose conversational AI copilot with deep integration")) {
    throw new Error("Found explanatory paragraph in /ai-assistant!");
  }
  console.log("✓ Explanatory paragraph confirmed REMOVED from /ai-assistant.");

  console.log("\n✓✓ ALL 14 TEST SECTIONS PASSED WITH ZERO ERRORS! GLOBAL CLEANUP VERIFIED! ✓✓\n");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
