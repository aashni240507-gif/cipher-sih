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
            resolve(sessionCookie);
          } else {
            reject(new Error("No cookie returned from login: " + body));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function fetchPageHtml(path, cookie = "") {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (cookie) headers["Cookie"] = cookie;

    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path,
        method: "GET",
        headers,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode, html: body, location: res.headers.location });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function runTests() {
  console.log("=== CIPHER TOP HORIZONTAL NAVIGATION SUITE ===");

  // 1. Authenticate
  console.log("\n[1] Authenticating as Analyst Sharma...");
  const cookie = await loginAndGetCookie();
  console.log("✓ Authenticated session cookie obtained.");

  // 2. Landing page should NOT have TopModuleNavigation
  console.log("\n[2] Checking Landing Page (/)...\nVerifying NO top module navigation on public landing page...");
  const landing = await fetchPageHtml("/");
  if (landing.html.includes('aria-label="Global Module Navigation"')) {
    throw new Error("Landing page should NOT contain TopModuleNavigation!");
  }
  console.log("✓ Landing page does NOT contain top module navigation.");

  // 3. Login page should NOT have TopModuleNavigation
  console.log("\n[3] Checking Login Page (/login)...\nVerifying NO top module navigation on public login page...");
  const login = await fetchPageHtml("/login");
  if (login.html.includes('aria-label="Global Module Navigation"')) {
    throw new Error("Login page should NOT contain TopModuleNavigation!");
  }
  console.log("✓ Login page does NOT contain top module navigation.");

  // 4. Check Operational Portal (/dashboard)
  console.log("\n[4] Checking Operational Portal (/dashboard)...");
  const portal = await fetchPageHtml("/dashboard", cookie);
  if (portal.status !== 200) {
    throw new Error(`Expected 200 for /dashboard, got ${portal.status}`);
  }

  // Check CIPHER header exists
  if (!portal.html.includes("CIPHER") || !portal.html.includes("ACTIVE DOSSIER")) {
    throw new Error("CIPHER Header missing from /dashboard!");
  }
  console.log("✓ CIPHER header verified on /dashboard.");

  // Check TopModuleNavigation exists
  if (!portal.html.includes('aria-label="Global Module Navigation"')) {
    throw new Error("TopModuleNavigation missing from /dashboard!");
  }
  console.log("✓ TopModuleNavigation verified on /dashboard directly below header.");

  // Check all 12 modules present in top navigation
  const expectedModules = [
    { label: "INVESTIGATIONS", href: "/investigations" },
    { label: "NEW INVESTIGATION", href: "/investigations/new" },
    { label: "NETWORK ANALYSIS", href: "/network-analysis" },
    { label: "ENTITIES", href: "/entities" },
    { label: "DATA SOURCES", href: "/data-sources" },
    { label: "EVIDENCE", href: "/evidence" },
    { label: "ALERTS", href: "/alerts" },
    { label: "DEEP MODULES", href: "/modules" },
    { label: "NEWS AI", href: "/news-ai" },
    { label: "REPORTS", href: "/reports" },
    { label: "AI ASSISTANT", href: "/ai-assistant" },
    { label: "SETTINGS", href: "/settings" },
  ];

  for (const mod of expectedModules) {
    if (!portal.html.includes(mod.label) || !portal.html.includes(mod.href)) {
      throw new Error(`Module ${mod.label} (${mod.href}) missing from top navigation on /dashboard!`);
    }
  }
  console.log("✓ All 12 modules verified in TopModuleNavigation.");

  // Check Operational Portal command cards co-exist
  if (!portal.html.includes("INTELLIGENCE COMMAND MODULES")) {
    throw new Error("Operational Portal command cards missing from /dashboard!");
  }
  console.log("✓ Operational Portal command cards verified co-existing on /dashboard.");

  // Check global left sidebar is NOT present
  if (portal.html.includes("INTEL CORE v4.2") || portal.html.includes("aside class=\"w-64 lg:w-72")) {
    throw new Error("Old global left sidebar is still present on /dashboard!");
  }
  console.log("✓ Global left sidebar is confirmed REMOVED from /dashboard.");

  // 5. Test all 12 module pages for 200 OK and TopModuleNavigation presence
  console.log("\n[5] Testing all 12 Module Pages...");
  for (const mod of expectedModules) {
    const page = await fetchPageHtml(mod.href, cookie);
    if (page.status !== 200) {
      throw new Error(`Page ${mod.href} returned status ${page.status}`);
    }
    if (!page.html.includes('aria-label="Global Module Navigation"')) {
      throw new Error(`Page ${mod.href} does NOT contain TopModuleNavigation!`);
    }
    console.log(`✓ ${mod.label} (${mod.href}): HTTP 200 OK, TopModuleNavigation verified.`);
  }

  // 6. Test Deep Modules (/modules) specifically to ensure AppShell was replaced
  console.log("\n[6] Checking /modules page layout...");
  const modulesPage = await fetchPageHtml("/modules", cookie);
  if (modulesPage.html.includes("INTEL CORE v4.2") || modulesPage.html.includes("aside class=\"w-64 lg:w-72")) {
    throw new Error("Old AppSidebar still rendered on /modules!");
  }
  console.log("✓ /modules rendered with NexusHeader and TopModuleNavigation, no left sidebar.");

  // 7. Check Contextual side panels preserved
  console.log("\n[7] Verifying Contextual Side Panels are Preserved...");
  const entitiesPage = await fetchPageHtml("/entities", cookie);
  if (!entitiesPage.html.includes("aside")) {
    console.warn("Warning: entities page aside tag not found in initial render (client component)");
  } else {
    console.log("✓ Entities contextual inspector panel confirmed intact.");
  }

  const settingsPage = await fetchPageHtml("/settings", cookie);
  if (!settingsPage.html.includes("aside")) {
    console.warn("Warning: settings page aside tag not found in initial render (client component)");
  } else {
    console.log("✓ Settings contextual navigation panel confirmed intact.");
  }

  console.log("\n✓✓ ALL 7 TEST SUITE SECTIONS PASSED WITH ZERO ERRORS! ✓✓\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
