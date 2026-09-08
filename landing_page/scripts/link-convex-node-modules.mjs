#!/usr/bin/env node
/**
 * Repoint `convex/node_modules` at THIS app's node_modules before building.
 *
 * The shared `convex/` folder lives outside both apps (SPEC.md §4), so its
 * bare imports — `convex/server` in `_generated/api.js`, `sequenzy` in
 * `emails.ts` — resolve by walking up from `convex/`, which only reaches
 * `convex/node_modules`. On Vercel only the app being deployed gets
 * installed, so each build links the shared folder to its own dependencies.
 */
import fs from "node:fs";
import path from "node:path";

const appDir = process.cwd();
const repoRoot = path.join(appDir, "..");
const link = path.join(repoRoot, "convex", "node_modules");
const target = path.join("..", path.basename(appDir), "node_modules");

if (!fs.existsSync(path.join(repoRoot, "convex", "_generated"))) {
  console.error(`link-convex: no convex/ folder at ${repoRoot} — run from an app directory.`);
  process.exit(1);
}
if (!fs.existsSync(path.join(appDir, "node_modules"))) {
  console.error(`link-convex: ${appDir}/node_modules missing — run install first.`);
  process.exit(1);
}

fs.rmSync(link, { force: true, recursive: true });
fs.symlinkSync(target, link, "dir");
console.log(`link-convex: convex/node_modules -> ${target}`);
