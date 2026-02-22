#!/usr/bin/env node

const DEFAULT_LIMIT = 20;

function parseArgs(argv) {
  const args = {
    limit: DEFAULT_LIMIT,
    json: false,
    source: "all",
    includeHot: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === "--json") {
      args.json = true;
      continue;
    }

    if (token === "--include-hot") {
      args.includeHot = true;
      continue;
    }

    if (token === "--limit") {
      const next = argv[i + 1];
      const parsed = Number.parseInt(next ?? "", 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("--limit must be a positive integer");
      }
      args.limit = parsed;
      i += 1;
      continue;
    }

    if (token === "--source") {
      const next = (argv[i + 1] ?? "").toLowerCase();
      if (!["all", "skills-sh", "clawhub"].includes(next)) {
        throw new Error("--source must be one of: all, skills-sh, clawhub");
      }
      args.source = next;
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  return response.text();
}

async function fetchClawhubTopByDownloads(limit) {
  const endpoint = new URL("https://wry-manatee-359.convex.site/api/v1/skills");
  endpoint.searchParams.set("sort", "downloads");
  endpoint.searchParams.set("nonSuspicious", "true");
  endpoint.searchParams.set("limit", String(limit));

  const payload = await fetchJson(endpoint.toString());
  const items = Array.isArray(payload.items) ? payload.items : [];

  return {
    source: "clawhub",
    queryUrl: "https://clawhub.ai/skills?sort=downloads&nonSuspicious=true",
    apiUrl: endpoint.toString(),
    metric: "downloads",
    items: items.slice(0, limit).map((item, index) => ({
      rank: index + 1,
      slug: item.slug,
      displayName: item.displayName,
      summary: item.summary ?? null,
      downloads: item.stats?.downloads ?? 0,
      installsAllTime: item.stats?.installsAllTime ?? 0,
      stars: item.stats?.stars ?? 0,
      latestVersion: item.latestVersion?.version ?? null,
      createdAt: item.createdAt ?? null,
      updatedAt: item.updatedAt ?? null
    }))
  };
}

function decodeEscaped(value) {
  return value
    .replaceAll('\\\\"', '"')
    .replaceAll("\\\\/", "/")
    .replaceAll("\\\\\\\\", "\\");
}

function parseSkillsShEntries(html) {
  const pattern = /\\\"source\\\":\\\"([^\\\"]+)\\\",\\\"skillId\\\":\\\"([^\\\"]+)\\\",\\\"name\\\":\\\"([^\\\"]+)\\\",\\\"installs\\\":(\d+)(?:,\\\"installsYesterday\\\":(\d+),\\\"change\\\":(-?\d+))?/g;

  const seen = new Set();
  const rows = [];
  let match;

  while ((match = pattern.exec(html)) !== null) {
    const sourcePath = decodeEscaped(match[1]);
    const skillId = decodeEscaped(match[2]);
    const name = decodeEscaped(match[3]);
    const installs = Number.parseInt(match[4], 10);
    const installsYesterday = match[5] === undefined ? null : Number.parseInt(match[5], 10);
    const change = match[6] === undefined ? null : Number.parseInt(match[6], 10);

    const key = `${sourcePath}::${skillId}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    rows.push({
      sourcePath,
      skillId,
      name,
      installs,
      installsYesterday,
      change,
      url: `https://skills.sh/${sourcePath}/${skillId}`
    });
  }

  return rows;
}

async function fetchSkillsShPopular(limit, includeHot = false) {
  const trendingUrl = "https://skills.sh/trending";
  const trendingHtml = await fetchText(trendingUrl);
  const trendingRows = parseSkillsShEntries(trendingHtml).slice(0, limit);

  let hotRows = [];
  if (includeHot) {
    const hotUrl = "https://skills.sh/hot";
    const hotHtml = await fetchText(hotUrl);
    hotRows = parseSkillsShEntries(hotHtml).slice(0, limit);
  }

  return {
    source: "skills-sh",
    queryUrl: "https://skills.sh/trending",
    metric: "installs",
    items: trendingRows.map((item, index) => ({
      rank: index + 1,
      sourcePath: item.sourcePath,
      skillId: item.skillId,
      name: item.name,
      installs: item.installs,
      url: item.url
    })),
    hot: includeHot
      ? {
          queryUrl: "https://skills.sh/hot",
          metric: "installs_delta",
          items: hotRows.map((item, index) => ({
            rank: index + 1,
            sourcePath: item.sourcePath,
            skillId: item.skillId,
            name: item.name,
            installs: item.installs,
            installsYesterday: item.installsYesterday,
            change: item.change,
            url: item.url
          }))
        }
      : undefined
  };
}

function printText(result) {
  if (result.skillsSh) {
    console.log("\n=== skills.sh (trending by installs) ===");
    for (const item of result.skillsSh.items) {
      console.log(`${item.rank}. ${item.name} (${item.skillId}) - installs: ${item.installs}`);
      console.log(`   ${item.url}`);
    }

    if (result.skillsSh.hot) {
      console.log("\n=== skills.sh (hot movers) ===");
      for (const item of result.skillsSh.hot.items) {
        const delta = item.change === null ? "n/a" : `${item.change >= 0 ? "+" : ""}${item.change}`;
        console.log(
          `${item.rank}. ${item.name} (${item.skillId}) - installs: ${item.installs}, yesterday: ${item.installsYesterday ?? "n/a"}, change: ${delta}`
        );
        console.log(`   ${item.url}`);
      }
    }
  }

  if (result.clawhub) {
    console.log("\n=== ClawHub (downloads, non-suspicious) ===");
    for (const item of result.clawhub.items) {
      console.log(
        `${item.rank}. ${item.displayName} (${item.slug}) - downloads: ${item.downloads}, stars: ${item.stars}, installs: ${item.installsAllTime}`
      );
    }
    console.log(`Source: ${result.clawhub.queryUrl}`);
  }

  console.log(`\nGenerated at: ${result.generatedAt}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const output = {
    generatedAt: new Date().toISOString(),
    limit: args.limit
  };

  if (args.source === "all" || args.source === "skills-sh") {
    output.skillsSh = await fetchSkillsShPopular(args.limit, args.includeHot);
  }

  if (args.source === "all" || args.source === "clawhub") {
    output.clawhub = await fetchClawhubTopByDownloads(args.limit);
  }

  if (args.json) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  printText(output);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to fetch popular skills: ${message}`);
  process.exitCode = 1;
});
