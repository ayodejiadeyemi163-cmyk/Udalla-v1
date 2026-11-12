#!/usr/bin/env node
/**
 * Content audit.
 * Fails on em dashes, en dashes, literal unicode apostrophes, banned wording
 * about who files a registration, and forbidden font families.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const roots = ["src", "docs", "supabase", "README.md", "CONTRIBUTING.md", "CLAUDE.md"];
const extensions = new Set([".ts", ".tsx", ".md", ".sql", ".js", ".mjs", ".json", ".css"]);

const problems = [];

const bannedPhrases = [
  /lawyers? (files|filed|prepare|prepares|submit|submits)/i,
  /attorney/i,
  /guaranteed approval/i,
];

async function walk(target) {
  let entries;
  try {
    entries = await readdir(target, { withFileTypes: true });
  } catch {
    const content = await readFile(target, "utf8");
    await inspect(target, content);
    return;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (extensions.has(path.extname(entry.name))) {
      await inspect(full, await readFile(full, "utf8"));
    }
  }
}

async function inspect(file, content) {
  const lines = content.split("\n");
  lines.forEach((line, index) => {
    if (line.includes("\u2014")) problems.push(`${file}:${index + 1} em dash`);
    if (line.includes("\u2013")) problems.push(`${file}:${index + 1} en dash`);
    if (line.includes("\\u2019")) problems.push(`${file}:${index + 1} literal unicode apostrophe`);
    for (const phrase of bannedPhrases) {
      if (phrase.test(line)) problems.push(`${file}:${index + 1} banned wording: ${phrase}`);
    }
    if (/font-family:\s*['"]?Inter/i.test(line)) problems.push(`${file}:${index + 1} Inter font`);
    if (/font-family:\s*['"]?Arial/i.test(line)) problems.push(`${file}:${index + 1} Arial font`);
  });
}

for (const root of roots) {
  await walk(root);
}

if (problems.length > 0) {
  console.error(`Content audit failed with ${problems.length} problem(s):`);
  for (const problem of problems.slice(0, 60)) console.error(`  ${problem}`);
  process.exit(1);
}

console.log("Content audit passed: no em dashes, no banned wording, no forbidden fonts.");
