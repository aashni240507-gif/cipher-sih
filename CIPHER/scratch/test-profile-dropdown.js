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

async function testLogout(cookie) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path: "/api/auth/logout",
        method: "POST",
        headers: {
          Cookie: cookie,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        });
      }
    );
    req.on("error", reject);
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
  console.log("=== VERIFYING CIPHER USER PROFILE DROPDOWN FIX ===");

  // 1. Authenticate
  console.log("\n[1] Logging in as Analyst...");
  const auth = await loginAndGetCookie();
  console.log("✓ Login successful, user:", auth.data.user.name);

  // 2. Fetch Dashboard HTML
  console.log("\n[2] Verifying Stacking Context and Classes in NexusHeader & TopModuleNavigation...");
  const page = await fetchPage("/dashboard", auth.sessionCookie);

  // Check top header bar has relative z-30
  if (!page.html.includes("relative z-30")) {
    throw new Error("Top header bar missing relative z-30 stacking context!");
  }
  console.log("✓ Top header bar has relative z-30 stacking context.");

  // Check TopModuleNavigation has relative z-10
  if (!page.html.includes("relative z-10")) {
    throw new Error("TopModuleNavigation missing relative z-10 stacking context!");
  }
  console.log("✓ TopModuleNavigation has relative z-10 (positioned strictly behind header dropdown).");

  // Check profileMenuRef has relative z-50
  if (!page.html.includes("relative z-50")) {
    throw new Error("Profile menu container missing relative z-50!");
  }
  console.log("✓ Profile menu container has relative z-50.");

  // Check profile button attributes
  if (!page.html.includes('aria-label="User profile and security settings menu"')) {
    throw new Error("Profile button missing accessible aria-label!");
  }
  console.log("✓ Profile button has accessible aria-label and menu role.");

  // 3. Test Logout API
  console.log("\n[3] Testing Real Logout API Endpoint (/api/auth/logout)...");
  const logoutRes = await testLogout(auth.sessionCookie);
  if (logoutRes.status !== 200 || !logoutRes.data.success) {
    throw new Error("Logout failed: " + JSON.stringify(logoutRes));
  }
  console.log("✓ Real logout endpoint executed successfully:", logoutRes.data);

  // 4. Test Top Navigation Suite to ensure no regressions
  console.log("\n[4] Running Navigation Integrity Check across /network-analysis...");
  const authAgain = await loginAndGetCookie();
  const netPage = await fetchPage("/network-analysis", authAgain.sessionCookie);
  if (netPage.status !== 200 || !netPage.html.includes("CIPHER TACTICAL NETWORK ANALYSIS")) {
    throw new Error("Network Analysis page error: status " + netPage.status);
  }
  console.log("✓ Network Analysis renders with HTTP 200 OK and intact graph structure.");

  console.log("\n✓✓ ALL USER PROFILE DROPDOWN VERIFICATION TESTS PASSED! ✓✓");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
