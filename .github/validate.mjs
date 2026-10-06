// Checks every process folder: PROCESS.md against the published core-2
// schema, routes that point at real steps, and a complete marketplace.json.
// Usage: node .github/validate.mjs [root] [schema path or URL]
// ponytail: structure and routes only; the site build runs the full validator
// (reachability, parallel branches, profiles) before anything is listed.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv/dist/2020.js";
import { parse } from "yaml";

const root = process.argv[2] ?? ".";
const schemaAt =
  process.argv[3] ??
  "https://raw.githubusercontent.com/agentprocess/agentprocess/main/schemas/core-2/process-document.json";
const schema = schemaAt.startsWith("http")
  ? await (await fetch(schemaAt)).json()
  : JSON.parse(readFileSync(schemaAt, "utf8"));
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);

const categories = [
  "Operations and finance",
  "Sales, customers and content",
  "People and projects",
  "Personal life",
];
const problems = [];

for (const dir of readdirSync(root, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name.startsWith(".")) continue;
  const slug = dir.name;
  const fail = (message) => problems.push(`${slug}: ${message}`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail("folder name must be lowercase words joined by hyphens");
  for (const file of ["PROCESS.md", "marketplace.json"])
    if (!existsSync(join(root, slug, file))) fail(`missing ${file}`);
  if (!existsSync(join(root, slug, "PROCESS.md")) || !existsSync(join(root, slug, "marketplace.json"))) continue;

  const source = readFileSync(join(root, slug, "PROCESS.md"), "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  let doc;
  try {
    doc = match && parse(match[1]);
  } catch (error) {
    fail(`PROCESS.md frontmatter is not valid YAML: ${error.message}`);
    continue;
  }
  if (!doc) {
    fail("PROCESS.md must start with YAML frontmatter between --- lines");
    continue;
  }
  if (!validate(doc))
    for (const e of validate.errors) fail(`PROCESS.md ${e.instancePath || "/"} ${e.message}`);
  if (doc.name !== slug) fail(`PROCESS.md name "${doc.name}" must match the folder name`);

  const steps = Array.isArray(doc.steps) ? doc.steps : [];
  const ids = steps.map((s) => s?.id);
  for (const id of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) fail(`duplicate step id ${id}`);
  const known = new Set([...ids, ...(steps.some((s) => s?.parallel) ? ["join"] : [])]);
  for (const s of steps) {
    const next = Array.isArray(s?.next) ? s.next.map((r) => (typeof r === "string" ? r : r?.to)) : [s?.next];
    for (const to of [...next, s?.on_reject, s?.on_timeout, ...(s?.parallel ?? [])])
      if (to !== undefined && !known.has(to)) fail(`step ${s.id} routes to ${to}, which is not a step`);
  }
  if (!steps.some((s) => s?.finish !== undefined)) fail("needs at least one finish step");

  let listing;
  try {
    listing = JSON.parse(readFileSync(join(root, slug, "marketplace.json"), "utf8"));
  } catch (error) {
    fail(`marketplace.json is not valid JSON: ${error.message}`);
    continue;
  }
  const allowed = ["title", "category", "audience", "outcome", "keywords", "author"];
  for (const key of Object.keys(listing)) if (!allowed.includes(key)) fail(`marketplace.json: unknown field ${key}`);
  for (const key of ["title", "audience", "outcome"])
    if (typeof listing[key] !== "string" || !listing[key].trim()) fail(`marketplace.json: ${key} is required`);
  if (!categories.includes(listing.category))
    fail(`marketplace.json: category must be one of ${categories.map((c) => `"${c}"`).join(", ")}`);
  if (!Array.isArray(listing.keywords) || listing.keywords.some((k) => typeof k !== "string"))
    fail("marketplace.json: keywords must be a list of search phrases");
  if (typeof listing.author?.name !== "string" || !listing.author.name.trim())
    fail("marketplace.json: author.name is required");
  if (listing.author?.url !== undefined && !/^https:\/\//.test(listing.author.url))
    fail("marketplace.json: author.url must start with https://");
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("All processes are valid.");
