/** TEMP: one-shot runner — starts `next start`, waits for 200, runs
 *  verify-directions.mjs, kills the server. (Background processes don't
 *  survive between terminal calls, so everything happens in one process.) */
import { execSync, spawn } from "node:child_process";

const server = spawn("pnpm", ["start"], { stdio: ["ignore", "pipe", "pipe"] });
let log = "";
server.stdout.on("data", (d) => (log += d));
server.stderr.on("data", (d) => (log += d));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const ok = await (async () => {
  for (let i = 0; i < 30; i++) {
    await wait(1000);
    try {
      const code = execSync(
        "curl -s --noproxy '*' -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/",
      ).toString();
      if (code.trim() === "200") return true;
    } catch {
      /* not up yet */
    }
  }
  return false;
})();

if (!ok) {
  console.error("SERVER NEVER CAME UP:\n" + log.slice(-1500));
  process.exit(1);
}
console.log("server is up");

try {
  execSync("node scripts/verify-site.mjs", {
    stdio: "inherit",
    env: { ...process.env, NO_PROXY: "127.0.0.1,localhost", no_proxy: "127.0.0.1,localhost" },
  });
} finally {
  server.kill("SIGTERM");
  process.exit(0);
}
