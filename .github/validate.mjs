// Checks every process folder: PROCESS.md against the published core-2
// schema, routes that point at real steps, and a complete marketplace.json.
// Usage: node .github/validate.mjs [root] [schema path or URL] [--readme]
// --readme also rewrites the catalog tables in README.md from the folders.
// ponytail: structure and routes only; the site build runs the full validator
// (reachability, parallel branches, profiles) before anything is listed.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv/dist/2020.js";
import { parse } from "yaml";

const args = process.argv.slice(2).filter((a) => a !== "--readme");
const writeReadme = process.argv.includes("--readme");
const root = args[0] ?? ".";
const schemaAt =
  args[1] ??
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
const listed = [];

for (const dir of readdirSync(root, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name.startsWith(".") || dir.name === "node_modules") continue;
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
  listed.push({ slug, listing, steps });
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("All processes are valid.");

if (writeReadme) {
  // One square per working step, coloured by who does it.
  const square = (s) =>
    s.agent !== undefined ? "🟩" : s.approve !== undefined ? "🟧" : s.task !== undefined ? "🟨" : s.parallel ? "⬜" : "🟦";
  const cell = (text) => String(text).replaceAll("|", "\\|");
  const official = (l) => l.author.name === "Agent Process";
  const tables = categories
    .map((category) => {
      const rows = listed
        .filter((p) => p.listing.category === category)
        .sort((a, b) => Number(official(b.listing)) - Number(official(a.listing)) || a.listing.title.localeCompare(b.listing.title))
        .map(({ slug, listing, steps }) => {
          const by = official(listing) ? "" : ` · Community, by ${cell(listing.author.name)}`;
          // Word joiners keep the strip on one line.
          const strip = steps.filter((s) => s.finish === undefined).map(square).join("\u2060");
          return `| [**${cell(listing.title)}**](${slug}/PROCESS.md)<br><sub>${cell(listing.audience)}${by}</sub> | ${cell(listing.outcome)} | ${strip} |`;
        });
      return rows.length
        ? `### ${category}\n\n| Process | What you get | Steps |\n|---|---|---|\n${rows.join("\n")}`
        : "";
    })
    .filter(Boolean)
    .join("\n\n");
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const start = "<!-- catalog:start -->";
  const end = "<!-- catalog:end -->";
  if (!readme.includes(start) || !readme.includes(end)) throw new Error(`README.md needs ${start} and ${end}`);
  writeFileSync(
    join(root, "README.md"),
    `${readme.slice(0, readme.indexOf(start) + start.length)}\n\n${tables}\n\n${readme.slice(readme.indexOf(end))}`,
  );
  console.log(`README.md catalog updated: ${listed.length} processes.`);
}
