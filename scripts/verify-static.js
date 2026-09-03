const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const required = ["index.html", "styles.css", "analytics.js", "validation.js", "app.js"];

for (const file of required) {
  const target = path.join(dist, file);
  if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
    throw new Error(`Missing or empty public asset: ${file}`);
  }
}

const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const localReferences = Array.from(html.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g), (match) => match[1]);
for (const reference of localReferences) {
  if (!fs.existsSync(path.join(dist, reference))) throw new Error(`Broken local reference: ${reference}`);
}

const requiredCopy = [
  "RuleRail",
  "Swift has deferred",
  "15 November 2026",
  "/_vercel/insights/script.js",
  "does not process payments"
];
for (const text of requiredCopy) {
  const available = html.includes(text) || fs.readFileSync(path.join(dist, "app.js"), "utf8").includes(text);
  if (!available) throw new Error(`Required product or disclosure copy missing: ${text}`);
}

console.log(`Static bundle verified: ${required.length} assets and ${localReferences.length} local references.`);
