import http from "http";
import { spawn } from "child_process";
import { createSessionToken } from "../src/lib/auth";

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkUrl(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers });
  const html = await res.text();
  return {
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get("content-type") || "",
    length: html.length,
    html,
  };
}

async function main() {
  console.log("Starting Next.js dev server on port 3011 for UI audit...");
  const devProcess = spawn("npx.cmd", ["next", "dev", "-p", "3011"], {
    stdio: "pipe",
    shell: true,
  });

  devProcess.stdout.on("data", (d) => {
    // console.log("[dev]", d.toString().trim());
  });

  devProcess.stderr.on("data", (d) => {
    // console.error("[dev err]", d.toString().trim());
  });

  function cleanup() {
    if (devProcess && devProcess.pid) {
      try {
        spawn("taskkill", ["/pid", devProcess.pid.toString(), "/T", "/F"]);
      } catch (e) {}
    }
  }

  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await wait(1000);
    try {
      const res = await fetch("http://localhost:3011/");
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch (e) {
      // still starting
    }
  }

  if (!ready) {
    console.error("Server did not become ready in time.");
    devProcess.kill();
    process.exit(1);
  }

  console.log("Server ready! Auditing public and admin pages...\n");

  const adminToken = await createSessionToken({
    id: "admin-1",
    email: "admin@rean.dev",
    displayName: "Lead Editor",
    role: "admin",
  });

  const adminHeaders = {
    Cookie: `rean_admin_session=${adminToken}`,
  };

  const pagesToTest = [
    // Public routes
    { path: "/", name: "Explore Homepage" },
    { path: "/about", name: "About Page" },
    { path: "/topics", name: "Categories Directory" },
    {
      path: "/?q=Java&type=book&difficulty=beginner",
      name: "Filtered Catalog",
    },
    { path: "/?q=does-not-exist-xyz", name: "Catalog Empty State" },
    { path: "/assets/ME.png", name: "Creator Portrait" },
    { path: "/topics/programming", name: "Topic: Programming" },
    { path: "/topics/backend", name: "Topic: Backend" },
    { path: "/topics/frontend", name: "Topic: Frontend" },
    { path: "/topics/databases", name: "Topic: Databases" },
    { path: "/topics/developer-tools", name: "Topic: Developer Tools" },
    { path: "/resources/java-programming", name: "Resource: Java Guide" },
    {
      path: "/resources/java-programming/01-modern-java-and-oop-foundations",
      name: "Chapter Reader: Java Ch 1",
    },
    { path: "/paths", name: "Learning Paths Index" },
    { path: "/paths/backend-foundations", name: "Path: Backend Foundations" },
    {
      path: "/paths/programming-foundations",
      name: "Path: Programming Foundations",
    },
    // Public asset check
    { path: "/images/logo.png", name: "Logo PNG image asset" },
    {
      path: "/uploads/practical-java-handbook.pdf",
      name: "Java Handbook PDF asset",
    },
    {
      path: "/uploads/study-session-tracker.zip",
      name: "Study Session ZIP asset",
    },
    // Admin routes
    { path: "/admin/login", name: "Admin Login" },
    { path: "/admin", name: "Admin Dashboard", headers: adminHeaders },
    { path: "/admin/topics", name: "Admin Topics", headers: adminHeaders },
    {
      path: "/admin/resources",
      name: "Admin Resources",
      headers: adminHeaders,
    },
    {
      path: "/admin/resources/new",
      name: "Admin New Resource",
      headers: adminHeaders,
    },
    { path: "/admin/chapters", name: "Admin Chapters", headers: adminHeaders },
    { path: "/admin/paths", name: "Admin Paths", headers: adminHeaders },
    { path: "/admin/paths/new", name: "Admin New Path", headers: adminHeaders },
    {
      path: "/admin/explore",
      name: "Admin Explore Editor",
      headers: adminHeaders,
    },
    { path: "/admin/about", name: "Admin About Editor", headers: adminHeaders },
    {
      path: "/admin/navigation",
      name: "Admin Navigation Editor",
      headers: adminHeaders,
    },
    {
      path: "/admin/assets",
      name: "Admin Assets & Media",
      headers: adminHeaders,
    },
    {
      path: "/admin/settings",
      name: "Admin Site Settings",
      headers: adminHeaders,
    },
  ];

  let errorsFound = 0;

  for (const page of pagesToTest) {
    try {
      const url = `http://localhost:3011${page.path}`;
      const result = await checkUrl(url, page.headers);

      if (result.status !== 200) {
        console.error(`❌ [${result.status}] ${page.name} (${page.path})`);
        errorsFound++;
        continue;
      }

      if (
        page.path.startsWith("/paths") &&
        !result.html.includes("Find your corner of the directory.")
      ) {
        errorsFound++;
        console.error("Retired path did not redirect to categories");
      }

      // If HTML, check for common UI issues
      if (result.contentType.includes("text/html")) {
        const issues: string[] = [];

        // Strip scripts and styles before checking for visible text issues
        const cleanHtml = result.html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

        // Check for undefined / null rendered in visible text
        const matches = cleanHtml.match(/>[^<]*\bundefined\b[^<]*</g);
        if (matches) {
          issues.push(
            `Visible 'undefined' text: ${matches.slice(0, 3).join(", ")}`,
          );
        }

        // Check for NaN in visible text
        const nanMatches = cleanHtml.match(/>[^<]*\bNaN\b[^<]*</g);
        if (nanMatches) {
          issues.push(
            `Visible 'NaN' text: ${nanMatches.slice(0, 3).join(", ")}`,
          );
        }

        // Check for broken img src
        const emptyImg = result.html.match(
          /<img[^>]+src=["'](undefined|null|)["']/g,
        );
        if (emptyImg) {
          issues.push(`Broken image src: ${emptyImg.join(", ")}`);
        }

        // Check for unrendered template tags
        const rawTemplates = cleanHtml.match(/\{\{[^}]+\}\}/g);
        if (rawTemplates) {
          issues.push(`Raw template markers: ${rawTemplates.join(", ")}`);
        }

        // Check for logo presence
        if (page.path === "/" || page.path === "/admin") {
          if (
            !result.html.includes("logo.png") &&
            !result.html.includes("Rean")
          ) {
            issues.push("Logo or Rean text not found in rendered markup");
          }
        }

        if (page.path === "/about") {
          for (const expected of [
            "Min Phanith",
            "Full Stack Developer",
            "https://github.com/Immonkei",
            "https://t.me/minphanith",
            "https://www.linkedin.com/in/minpanith/",
            "minn.phanithh@gmail.com",
            "%2Fassets%2FME.png",
          ]) {
            if (!result.html.includes(expected))
              issues.push("Missing profile detail: " + expected);
          }
        }
        if (page.path === "/") {
          if (!result.html.includes("learning-illustration"))
            issues.push("Missing animated illustration");
          if (!result.html.includes("Staff picks"))
            issues.push("Missing staff picks");
          if (cleanHtml.includes('href="/paths'))
            issues.push("Retired learning path navigation remains visible");
        }
        if (issues.length > 0) {
          console.warn(`⚠️ ${page.name} (${page.path}) had issues:`, issues);
          errorsFound += issues.length;
        } else {
          console.log(
            `✅ [200 OK] ${page.name} (${page.path}) - HTML ${result.length} bytes`,
          );
        }
      } else {
        console.log(
          `✅ [200 OK] ${page.name} (${page.path}) - ${result.contentType} (${result.length} bytes)`,
        );
      }
    } catch (err: any) {
      console.error(`❌ Error fetching ${page.name}:`, err.message);
      errorsFound++;
    }
  }

  console.log(`\nAudit completed with ${errorsFound} issues.`);

  // Kill dev process
  devProcess.kill();
  process.exit(errorsFound > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Audit failure:", err);
  process.exit(1);
});
