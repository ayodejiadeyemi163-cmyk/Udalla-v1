#!/usr/bin/env node
/**
 * Link crawl.
 * Usage: node scripts/crawl.mjs https://example.com
 *
 * Fetches every URL in the sitemap, then follows internal links up to a cap.
 * Fails on a non 200 page, an em dash, or a currency code in visible text.
 */

const base = (process.argv[2] || process.env.BASE_URL || "http://127.0.0.1:3100").replace(
  /\/$/,
  "",
);
const origin = new URL(base).origin;
const MAX_PAGES = Number(process.env.CRAWL_MAX || 80);
const skipPrefixes = ["/dashboard", "/admin", "/lawyer", "/login", "/thank-you", "/api", "/logout", "/auth"];

const queue = [];
const seen = new Set();
const failures = [];
const contentIssues = [];
let checked = 0;

function enqueue(url) {
  if (!url.startsWith(origin)) return;
  const parsed = new URL(url);
  if (skipPrefixes.some((prefix) => parsed.pathname.startsWith(prefix))) return;
  const key = parsed.pathname + parsed.search;
  if (seen.has(key)) return;
  if (seen.size > MAX_PAGES) return;
  seen.add(key);
  queue.push(parsed.toString());
}

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ");
}

try {
  const sitemapResponse = await fetch(`${base}/sitemap.xml`);
  if (sitemapResponse.ok) {
    const xml = await sitemapResponse.text();
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      enqueue(match[1]);
    }
  }
  enqueue(`${base}/`);
  enqueue(`${base}/pricing`);
  enqueue(`${base}/websites`);
  enqueue(`${base}/faq`);
} catch (error) {
  console.error(`Could not reach ${base}: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}

while (queue.length > 0) {
  const url = queue.shift();
  if (!url) break;
  checked += 1;
  let response;
  try {
    response = await fetch(url, { redirect: "follow" });
  } catch (error) {
    failures.push(`${url} network error: ${error instanceof Error ? error.message : error}`);
    continue;
  }

  if (response.status !== 200) {
    failures.push(`${url} returned ${response.status}`);
    continue;
  }

  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) continue;

  const html = await response.text();
  const text = strip(html);

  if (text.includes("\u2014")) contentIssues.push(`${url} contains an em dash`);
  if (text.includes("\u2013")) contentIssues.push(`${url} contains an en dash`);
  if (/\b(NGN|USD|GBP)\b/.test(text)) {
    contentIssues.push(`${url} shows a currency code in body copy`);
  }

  for (const match of html.matchAll(/href="([^"#]+)"/g)) {
    const href = match[1];
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    if (href.startsWith("http")) {
      enqueue(href);
    } else if (href.startsWith("/")) {
      enqueue(`${base}${href}`);
    }
  }
}

console.log(`Crawled ${checked} page(s) on ${base}`);
if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const failure of failures) console.error(`  ${failure}`);
}
if (contentIssues.length > 0) {
  console.error(`\n${contentIssues.length} content issue(s):`);
  for (const issue of contentIssues.slice(0, 40)) console.error(`  ${issue}`);
}
if (failures.length === 0 && contentIssues.length === 0) {
  console.log("All crawled pages returned 200 with clean copy.");
}
process.exit(failures.length > 0 || contentIssues.length > 0 ? 1 : 0);
