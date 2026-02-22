#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_TOP = 50;
const DEFAULT_AUTHOR = "@spellbook-generator";
const FALLBACK_OUTPUT_DIR = "spells";
const USER_AGENT = "openclaw-spellbook/spell-mapping-generator";

const FALLBACK_POPULAR_SKILLS = [
  "search-web",
  "read-file",
  "write-file",
  "edit-file",
  "create-file",
  "delete-file",
  "list-files",
  "move-file",
  "copy-file",
  "fix-bugs",
  "debug-code",
  "run-tests",
  "lint-code",
  "format-code",
  "build-project",
  "deploy",
  "start-server",
  "stop-server",
  "restart-service",
  "kill-process",
  "install-deps",
  "update-deps",
  "git-status",
  "git-diff",
  "git-commit",
  "git-branch",
  "git-merge",
  "git-rebase",
  "review-code",
  "open-pr",
  "merge-pr",
  "query-db",
  "run-sql",
  "migrate-db",
  "fetch-api",
  "call-api",
  "parse-json",
  "transform-data",
  "extract-data",
  "scrape-web",
  "analyze-logs",
  "monitor-service",
  "backup-data",
  "restore-data",
  "write-docs",
  "summarize-text",
  "translate-text",
  "plan-task",
  "refactor-code",
  "generate-tests",
  "explain-code",
  "package-release",
  "publish-package",
  "docker-build",
  "docker-run",
  "kubectl-apply",
  "terraform-plan",
  "terraform-apply",
  "ci-run",
  "release-notes"
];

const BASE_PROFILE = {
  id: "arcane",
  fallbackIcon: "✨",
  verbs: {
    search: "Divine",
    read: "Study",
    write: "Inscribe",
    create: "Conjure",
    edit: "Etch",
    delete: "Banish",
    deploy: "Summon",
    build: "Forge",
    test: "Trial",
    lint: "Purify",
    format: "Align",
    fix: "Cleanse",
    debug: "Reveal",
    install: "Bind",
    update: "Refine",
    run: "Invoke",
    start: "Awaken",
    stop: "Quell",
    restart: "Rekindle",
    kill: "Sever",
    git: "Archive",
    review: "Appraise",
    plan: "Chart",
    explain: "Illuminate",
    transform: "Transmute",
    extract: "Harvest",
    parse: "Decode",
    query: "Consult",
    monitor: "Scry",
    backup: "Ward",
    restore: "Recall",
    publish: "Proclaim",
    release: "Unseal",
    default: "Invoke"
  },
  objects: {
    web: "the Weave",
    file: "the Grimoire",
    code: "the Runes",
    data: "the Ledger",
    database: "the Archive",
    process: "the Familiar",
    service: "the Beacon",
    api: "the Gate",
    repo: "the Repository",
    docs: "the Codex",
    infra: "the Citadel",
    package: "the Relic",
    tests: "the Trials",
    logs: "the Echoes",
    task: "the Rite",
    default: "the Rite"
  },
  icons: {
    search: "🔮",
    read: "📖",
    write: "📜",
    create: "✨",
    edit: "✍️",
    delete: "🗡️",
    deploy: "🚀",
    build: "⚒️",
    test: "🧪",
    lint: "🧹",
    format: "📐",
    fix: "💧",
    debug: "🕯️",
    install: "🪢",
    update: "♻️",
    run: "⚡",
    start: "🌅",
    stop: "🛑",
    restart: "🔥",
    kill: "⚔️",
    git: "🗃️",
    review: "👁️",
    plan: "🗺️",
    explain: "💡",
    transform: "🧬",
    extract: "⛏️",
    parse: "🔍",
    query: "📡",
    monitor: "📈",
    backup: "🛡️",
    restore: "🕰️",
    publish: "📣",
    release: "📦",
    default: "✨"
  },
  suffixes: ["Echoes", "Sigil", "Ward", "Rite", "Canticle", "Circuit"]
};

const THEME_PROFILES = [
  {
    match: /(harry\s*potter|hogwarts|wizarding|quidditch|dumbledore|voldemort)/i,
    profile: {
      id: "harry-potter",
      verbs: {
        search: "Accio",
        read: "Peruse",
        write: "Inscribe",
        create: "Conjure",
        delete: "Evanesco",
        fix: "Reparo",
        debug: "Revelio",
        deploy: "Apparate",
        kill: "Expelliarmus",
        monitor: "Maraud",
        default: "Cast"
      },
      objects: {
        web: "the Marauder Map",
        file: "the Parchment",
        code: "the Spellbook",
        repo: "the Archives",
        task: "the Charm",
        default: "the Charm"
      },
      icons: {
        default: "🪄",
        debug: "🕵️",
        deploy: "🦉"
      },
      suffixes: ["Patronus", "Pensieve", "Hallows", "Horcrux", "Phoenix"]
    }
  },
  {
    match: /(star\s*wars|jedi|sith|lightsaber|skywalker|mandalorian|force)/i,
    profile: {
      id: "star-wars",
      verbs: {
        search: "Sense",
        read: "Consult",
        write: "Engrave",
        create: "Manifest",
        fix: "Balance",
        debug: "Reveal",
        deploy: "Launch",
        kill: "Strike",
        monitor: "Track",
        default: "Channel"
      },
      objects: {
        web: "the Holonet",
        file: "the Datacard",
        code: "the Holocron",
        repo: "the Jedi Archives",
        process: "the Droid",
        infra: "the Fleet",
        default: "the Force"
      },
      icons: {
        default: "🌌",
        deploy: "🛰️",
        kill: "🗡️"
      },
      suffixes: ["Kyber", "Tatooine", "Coruscant", "Alderaan", "Naboo"]
    }
  },
  {
    match: /(genshin|teyvat|mondstadt|liyue|inazuma|sumeru|fontaine|natlan|snezhnaya)/i,
    profile: {
      id: "genshin",
      verbs: {
        search: "Survey",
        read: "Study",
        write: "Inscribe",
        create: "Conjure",
        fix: "Cleanse",
        deploy: "Ascend",
        debug: "Unveil",
        run: "Resonate",
        default: "Invoke"
      },
      objects: {
        web: "Elemental Sight",
        file: "the Tablet",
        code: "the Leyline",
        process: "the Construct",
        task: "the Resonance",
        default: "the Resonance"
      },
      icons: {
        default: "✨",
        fix: "💧",
        search: "👁️"
      },
      suffixes: ["Anemo", "Geo", "Electro", "Dendro", "Hydro", "Pyro", "Cryo"]
    }
  },
  {
    match: /(cyberpunk|netrunner|edgerunners|night\s*city|neuromancer|mech|android)/i,
    profile: {
      id: "cyberpunk",
      verbs: {
        search: "Trace",
        read: "Scan",
        write: "Patch",
        create: "Compile",
        edit: "Patch",
        fix: "Hotfix",
        debug: "Trace",
        deploy: "Jack-In",
        monitor: "Ping",
        default: "Execute"
      },
      objects: {
        web: "the Grid",
        file: "the Shard",
        code: "the ICE",
        data: "the Datastream",
        repo: "the Blackwall Cache",
        infra: "the Rig",
        process: "the Daemon",
        default: "the Stack"
      },
      icons: {
        default: "🤖",
        monitor: "📡",
        deploy: "🧷"
      },
      suffixes: ["Neon", "Chrome", "ICE", "Daemon", "Blackwall"]
    }
  },
  {
    match: /(pirate|one\s*piece|corsair|buccaneer|captain|kraken|sea|ocean)/i,
    profile: {
      id: "pirate",
      verbs: {
        search: "Scout",
        read: "Chart",
        write: "Log",
        create: "Rig",
        delete: "Scuttle",
        deploy: "Set Sail",
        fix: "Patch",
        monitor: "Spyglass",
        default: "Crew"
      },
      objects: {
        web: "the Horizon",
        file: "the Captain's Log",
        code: "the Map",
        process: "the Cannons",
        repo: "the Hold",
        task: "the Voyage",
        default: "the Voyage"
      },
      icons: {
        default: "🏴‍☠️",
        deploy: "⛵",
        monitor: "🔭"
      },
      suffixes: ["Kraken", "Reef", "Tempest", "Harbor", "Treasure"]
    }
  },
  {
    match: /(marvel|dc\b|avengers|x-men|superhero|batman|superman|spider-man|iron\s*man)/i,
    profile: {
      id: "superhero",
      verbs: {
        search: "Detect",
        read: "Brief",
        write: "Draft",
        create: "Assemble",
        fix: "Stabilize",
        debug: "Expose",
        deploy: "Launch",
        kill: "Neutralize",
        default: "Activate"
      },
      objects: {
        web: "the Network",
        file: "the Dossier",
        code: "the Suit",
        process: "the Threat",
        repo: "the HQ",
        infra: "the Helicarrier",
        default: "the Protocol"
      },
      icons: {
        default: "🦸",
        deploy: "🛫",
        kill: "🛡️"
      },
      suffixes: ["Titan", "Arc", "Shield", "Gamma", "Vibranium"]
    }
  },
  {
    match: /(pokemon|pok[eé]mon|kanto|johto|paldea|trainer|gym|pikachu)/i,
    profile: {
      id: "pokemon",
      verbs: {
        search: "Track",
        read: "Check",
        write: "Teach",
        create: "Summon",
        fix: "Heal",
        deploy: "Send Out",
        monitor: "Observe",
        default: "Use"
      },
      objects: {
        web: "the Pokédex",
        file: "the Pokédex Entry",
        code: "the Move Set",
        process: "the Team Slot",
        data: "the PC Box",
        default: "the Move"
      },
      icons: {
        default: "⚡",
        fix: "💊",
        deploy: "🎯"
      },
      suffixes: ["Kanto", "Johto", "Hoenn", "Sinnoh", "Paldea"]
    }
  }
];

function printHelp() {
  console.log(`Generate a themed OpenClaw spell mapping YAML.

Usage:
  node spell-mapping-generator/scripts/generate-spell-mapping.mjs --theme "Wizarding World" [options]
  node magic-quill/scripts/generate-spell-mapping.mjs --topic "Harry Potter" [options]
  node magic-quill/scripts/generate-spell-mapping.mjs --url "https://example.com/wiki/theme" [options]

Options:
  --theme <name>      Explicit theme name (also works without topic/url in heuristic mode)
  --topic <name>      Theme topic/game/movie/franchise name
  --url <url>         URL to fetch lore/context text from
  --out <path>        Output YAML path (default: spells/<theme-slug>.yaml)
  --output <path>     Alias for --out
  --limit <n>         Target coverage count (default: 50)
  --top <n>           Alias for --limit
  --author <name>     YAML author field (default: @spellbook-generator)
  --help              Show this help

Examples:
  npm run generate:spellbook-theme -- --theme "Star Wars" --limit 10 --author "@you"
  npm run generate:spellbook-theme -- --topic "Star Wars" --limit 50 --author "@you"
  npm run generate:spellbook-theme -- --url "https://en.wikipedia.org/wiki/Cyberpunk_2077" --limit 75 --out spells/cyberpunk.yaml
`);
}

function parseArgs(argv) {
  const args = {
    theme: "",
    topic: "",
    url: "",
    output: "",
    top: DEFAULT_TOP,
    author: DEFAULT_AUTHOR
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--help" || token === "-h") {
      printHelp();
      process.exit(0);
    }

    if (token === "--theme") {
      args.theme = String(argv[index + 1] ?? "").trim();
      index += 1;
      continue;
    }

    if (token === "--topic") {
      args.topic = String(argv[index + 1] ?? "").trim();
      index += 1;
      continue;
    }

    if (token === "--url") {
      args.url = String(argv[index + 1] ?? "").trim();
      index += 1;
      continue;
    }

    if (token === "--out" || token === "--output") {
      args.output = String(argv[index + 1] ?? "").trim();
      index += 1;
      continue;
    }

    if (token === "--top" || token === "--limit") {
      const value = Number.parseInt(String(argv[index + 1] ?? ""), 10);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`${token} must be a positive integer`);
      }
      args.top = value;
      index += 1;
      continue;
    }

    if (token === "--author") {
      args.author = String(argv[index + 1] ?? "").trim();
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  if (!args.theme && !args.topic && !args.url) {
    throw new Error("Provide at least one of --theme, --topic, or --url");
  }

  if (args.url) {
    try {
      new URL(args.url);
    } catch {
      throw new Error(`Invalid --url value: ${args.url}`);
    }
  }

  if (!args.author) {
    args.author = DEFAULT_AUTHOR;
  }

  return args;
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT,
      ...headers
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
      accept: "text/html,application/xhtml+xml",
      "user-agent": USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  return response.text();
}

function decodeEscaped(value) {
  return value
    .replaceAll('\\\\\"', '"')
    .replaceAll("\\\\/", "/")
    .replaceAll("\\\\\\\\", "\\");
}

function parseSkillsShEntries(html) {
  const pattern =
    /\\\"source\\\":\\\"([^\\\"]+)\\\",\\\"skillId\\\":\\\"([^\\\"]+)\\\",\\\"name\\\":\\\"([^\\\"]+)\\\",\\\"installs\\\":(\d+)(?:,\\\"installsYesterday\\\":(\d+),\\\"change\\\":(-?\d+))?/g;

  const seen = new Set();
  const rows = [];
  let match;

  while ((match = pattern.exec(html)) !== null) {
    const sourcePath = decodeEscaped(match[1]);
    const skillId = decodeEscaped(match[2]);
    const name = decodeEscaped(match[3]);
    const installs = Number.parseInt(match[4], 10);
    const key = `${sourcePath}::${skillId}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    rows.push({
      sourcePath,
      skillId,
      name,
      installs
    });
  }

  return rows;
}

async function fetchSkillsShTrending(limit) {
  const html = await fetchText("https://skills.sh/trending");
  const rows = parseSkillsShEntries(html);

  if (rows.length === 0) {
    throw new Error("No skills parsed from skills.sh trending page");
  }

  return rows.slice(0, limit).map((row, index) => ({
    rank: index + 1,
    skillId: row.skillId,
    displayName: row.name,
    metricValue: row.installs,
    sourcePath: row.sourcePath
  }));
}

function normalizeSkillId(value) {
  if (value === null || value === undefined) {
    return null;
  }

  let next = String(value).trim().toLowerCase();
  if (!next) {
    return null;
  }

  if (next.includes("/")) {
    next = next.split("/").pop() ?? next;
  }

  next = next
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!next || !/^[a-z0-9][a-z0-9-]*$/.test(next)) {
    return null;
  }

  return next;
}

async function fetchClawhubDownloads(limit) {
  const endpoints = [
    "https://wry-manatee-359.convex.site/api/v1/skills",
    "https://clawhub.ai/api/v1/skills",
    "https://api.clawhub.ai/v1/skills"
  ];

  let lastError = null;

  for (const baseUrl of endpoints) {
    try {
      const endpoint = new URL(baseUrl);
      endpoint.searchParams.set("sort", "downloads");
      endpoint.searchParams.set("nonSuspicious", "true");
      endpoint.searchParams.set("limit", String(limit));

      const payload = await fetchJson(endpoint.toString());
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.items)
          ? payload.items
          : [];

      const items = rawItems
        .map((item, index) => {
          const skillId =
            normalizeSkillId(item.skillId) ||
            normalizeSkillId(item.slug) ||
            normalizeSkillId(item.name) ||
            normalizeSkillId(item.displayName);

          if (!skillId) {
            return null;
          }

          return {
            rank: index + 1,
            skillId,
            displayName:
              item.displayName ||
              item.name ||
              item.title ||
              item.slug ||
              item.skillId ||
              skillId,
            metricValue:
              Number(item.stats?.downloads) ||
              Number(item.downloads) ||
              Number(item.installs) ||
              0
          };
        })
        .filter(Boolean);

      if (items.length === 0) {
        throw new Error(`No skill items parsed from ${baseUrl}`);
      }

      return {
        items: items.slice(0, limit),
        apiUrl: endpoint.toString()
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function mergePopularSkills({ skillsShItems, clawhubItems, targetCount }) {
  const merged = new Map();

  function touch(sourceName, items) {
    for (const item of items) {
      const skillId = normalizeSkillId(item.skillId);
      if (!skillId) {
        continue;
      }

      const entry =
        merged.get(skillId) ??
        {
          skillId,
          score: 0,
          bestRank: Number.POSITIVE_INFINITY,
          sources: new Set(),
          names: new Set()
        };

      const weight = Math.max(targetCount * 2 - item.rank + 1, 1);
      entry.score += weight;
      entry.bestRank = Math.min(entry.bestRank, item.rank);
      entry.sources.add(sourceName);
      if (item.displayName) {
        entry.names.add(String(item.displayName));
      }

      merged.set(skillId, entry);
    }
  }

  touch("skills.sh", skillsShItems);
  touch("clawhub", clawhubItems);

  const ranked = [...merged.values()]
    .map((entry) => ({
      skillId: entry.skillId,
      score: entry.score + (entry.sources.size > 1 ? targetCount : 0),
      bestRank: entry.bestRank,
      sourceCount: entry.sources.size,
      sources: [...entry.sources].sort(),
      displayName: [...entry.names][0] ?? entry.skillId
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (a.bestRank !== b.bestRank) {
        return a.bestRank - b.bestRank;
      }
      return a.skillId.localeCompare(b.skillId);
    });

  const ids = [];
  const seen = new Set();

  for (const item of ranked) {
    if (seen.has(item.skillId)) {
      continue;
    }
    seen.add(item.skillId);
    ids.push(item.skillId);
    if (ids.length >= targetCount) {
      break;
    }
  }

  for (const skillId of FALLBACK_POPULAR_SKILLS) {
    if (seen.has(skillId)) {
      continue;
    }
    seen.add(skillId);
    ids.push(skillId);
    if (ids.length >= targetCount) {
      break;
    }
  }

  return ids;
}

function decodeHtmlEntities(input) {
  if (!input) {
    return "";
  }

  const named = new Map([
    ["amp", "&"],
    ["lt", "<"],
    ["gt", ">"],
    ["quot", '"'],
    ["apos", "'"],
    ["nbsp", " "]
  ]);

  return input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (full, code) => {
    const normalized = String(code).toLowerCase();

    if (named.has(normalized)) {
      return named.get(normalized);
    }

    if (normalized.startsWith("#x")) {
      const value = Number.parseInt(normalized.slice(2), 16);
      return Number.isFinite(value) ? String.fromCodePoint(value) : full;
    }

    if (normalized.startsWith("#")) {
      const value = Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : full;
    }

    return full;
  });
}

function extractMeta(html, attrName, attrValue) {
  const pattern = new RegExp(
    `<meta[^>]+${attrName}=["']${attrValue}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const match = html.match(pattern);
  return match ? decodeHtmlEntities(match[1]).trim() : "";
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtmlEntities(match[1]).replace(/\s+/g, " ").trim() : "";
}

function stripHtmlToText(html) {
  const noScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const text = noScripts
    .replace(/<\/(p|div|li|section|article|h[1-6]|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return decodeHtmlEntities(text);
}

async function fetchLoreFromUrl(url) {
  const html = await fetchText(url);
  const title = extractTitle(html);
  const description =
    extractMeta(html, "property", "og:description") ||
    extractMeta(html, "name", "description");
  const bodyText = stripHtmlToText(html).slice(0, 12000);

  return {
    mode: "url",
    source: url,
    title,
    summary: description,
    text: [title, description, bodyText].filter(Boolean).join("\n\n")
  };
}

async function fetchLoreFromWikipedia(topic) {
  const normalized = topic.trim().replace(/\s+/g, "_");
  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(normalized)}`;
  const payload = await fetchJson(endpoint);

  const title = typeof payload.title === "string" ? payload.title : topic;
  const summary = typeof payload.extract === "string" ? payload.extract : "";
  const description = typeof payload.description === "string" ? payload.description : "";

  if (!title && !summary && !description) {
    throw new Error("Wikipedia summary response did not include usable text");
  }

  return {
    mode: "wikipedia",
    source:
      payload.content_urls?.desktop?.page ||
      payload.content_urls?.mobile?.page ||
      endpoint,
    title,
    summary: [description, summary].filter(Boolean).join(". "),
    text: [title, description, summary].filter(Boolean).join("\n\n")
  };
}

function prettifySlug(text) {
  return text
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function inferThemeName(args, lore) {
  if (args.theme) {
    return args.theme.trim();
  }

  if (args.topic) {
    return args.topic.trim();
  }

  if (lore?.title) {
    return lore.title.trim();
  }

  if (args.url) {
    try {
      const parsed = new URL(args.url);
      const tail = parsed.pathname.split("/").filter(Boolean).pop();
      if (tail) {
        return prettifySlug(tail);
      }
      return prettifySlug(parsed.hostname.replace(/^www\./, ""));
    } catch {
      return "Custom Theme";
    }
  }

  return "Custom Theme";
}

function selectThemeProfile({ themeName, loreText, url }) {
  const haystack = [themeName, loreText, url].filter(Boolean).join(" \n ").toLowerCase();

  for (const candidate of THEME_PROFILES) {
    if (candidate.match.test(haystack)) {
      return mergeProfile(candidate.profile);
    }
  }

  return mergeProfile({});
}

function mergeProfile(overrides) {
  return {
    id: overrides.id ?? BASE_PROFILE.id,
    fallbackIcon: overrides.fallbackIcon ?? BASE_PROFILE.fallbackIcon,
    verbs: { ...BASE_PROFILE.verbs, ...(overrides.verbs ?? {}) },
    objects: { ...BASE_PROFILE.objects, ...(overrides.objects ?? {}) },
    icons: { ...BASE_PROFILE.icons, ...(overrides.icons ?? {}) },
    suffixes: [...(overrides.suffixes ?? []), ...BASE_PROFILE.suffixes]
  };
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "") || "theme";
}

function compactWords(text) {
  return String(text)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(text) {
  return compactWords(text)
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (/^[a-z]{1,3}$/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

const TOKEN_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "into",
  "over",
  "under",
  "your",
  "this",
  "that",
  "skill",
  "skills",
  "tool",
  "tools",
  "openclaw",
  "spellbook",
  "wiki",
  "wikipedia"
]);

function extractLoreKeywords(themeName, loreText) {
  const source = [themeName, loreText].filter(Boolean).join(" ");
  const words = source.match(/[A-Za-z][A-Za-z0-9']{2,}/g) ?? [];
  const ranked = [];
  const seen = new Set();

  for (const rawWord of words) {
    const cleaned = rawWord.replace(/'s$/i, "");
    const lower = cleaned.toLowerCase();
    if (TOKEN_STOPWORDS.has(lower)) {
      continue;
    }
    if (seen.has(lower)) {
      continue;
    }
    seen.add(lower);
    ranked.push(titleCase(cleaned));
    if (ranked.length >= 24) {
      break;
    }
  }

  return ranked;
}

function hasAny(tokens, values) {
  return values.some((value) => tokens.includes(value));
}

function classifySkillId(skillId) {
  const tokens = skillId.split("-").filter(Boolean);
  const tokenSet = new Set(tokens);
  const has = (...values) => values.some((value) => tokenSet.has(value));

  let action = "default";
  if (has("search", "find", "lookup", "scrape", "crawl")) action = "search";
  else if (has("read", "open", "view", "cat", "show")) action = "read";
  else if (has("write", "save")) action = "write";
  else if (has("create", "scaffold", "init", "new", "generate")) action = "create";
  else if (has("edit", "patch", "modify", "update")) action = "edit";
  else if (has("delete", "remove", "rm", "clean", "cleanup", "prune")) action = "delete";
  else if (has("deploy", "ship")) action = "deploy";
  else if (has("build", "compile", "bundle")) action = "build";
  else if (has("test", "tests", "verify", "validate", "check")) action = "test";
  else if (has("lint")) action = "lint";
  else if (has("format", "fmt", "prettify")) action = "format";
  else if (has("fix", "repair", "heal")) action = "fix";
  else if (has("debug", "trace", "troubleshoot")) action = "debug";
  else if (has("install", "add")) action = "install";
  else if (has("upgrade")) action = "update";
  else if (has("run", "exec", "execute", "invoke")) action = "run";
  else if (has("start", "serve", "boot")) action = "start";
  else if (has("stop")) action = "stop";
  else if (has("restart", "reload")) action = "restart";
  else if (has("kill", "terminate")) action = "kill";
  else if (has("git", "commit", "branch", "merge", "rebase", "diff")) action = "git";
  else if (has("review", "audit")) action = "review";
  else if (has("plan", "design", "architect")) action = "plan";
  else if (has("explain", "describe", "summarize", "summary")) action = "explain";
  else if (has("transform", "convert")) action = "transform";
  else if (has("extract")) action = "extract";
  else if (has("parse")) action = "parse";
  else if (has("query", "ask")) action = "query";
  else if (has("monitor", "watch", "observe", "trace")) action = "monitor";
  else if (has("backup")) action = "backup";
  else if (has("restore")) action = "restore";
  else if (has("publish")) action = "publish";
  else if (has("release")) action = "release";

  let target = "default";
  if (has("web", "internet", "browser", "site", "url", "page")) target = "web";
  else if (has("file", "files", "fs", "path", "doc", "pdf")) target = "file";
  else if (has("code", "repo", "source")) target = "code";
  else if (has("data", "json", "csv", "xml")) target = "data";
  else if (has("db", "database", "sql", "postgres", "mysql", "mongo")) target = "database";
  else if (has("process", "proc", "daemon", "server")) target = "process";
  else if (has("service", "app")) target = "service";
  else if (has("api", "http", "rest", "graphql")) target = "api";
  else if (has("git", "commit", "branch", "merge", "rebase", "diff", "pr")) target = "repo";
  else if (has("docs", "doc", "readme", "wiki")) target = "docs";
  else if (has("docker", "k8s", "kubernetes", "kubectl", "terraform", "cloud", "infra")) target = "infra";
  else if (has("package", "npm", "pip", "deps", "dependency")) target = "package";
  else if (has("test", "tests")) target = "tests";
  else if (has("log", "logs", "trace")) target = "logs";
  else if (action === "git") target = "repo";
  else if (action === "query") target = "database";
  else if (action === "backup" || action === "restore") target = "data";
  else if (action === "deploy") target = "infra";
  else if (action === "test" || action === "lint" || action === "format" || action === "fix" || action === "debug") target = "code";
  else if (action === "write" || action === "edit") target = "file";
  else if (action === "monitor") target = "service";
  else target = "task";

  return {
    skillId,
    tokens,
    action,
    target
  };
}

function pickQualifier(tokens) {
  const ignore = new Set([
    "skill",
    "skills",
    "tool",
    "tools",
    "web",
    "file",
    "files",
    "code",
    "data",
    "db",
    "database",
    "sql",
    "api",
    "git",
    "repo",
    "process",
    "service",
    "server",
    "task",
    "read",
    "write",
    "create",
    "edit",
    "delete",
    "deploy",
    "build",
    "test",
    "tests",
    "lint",
    "format",
    "fix",
    "debug",
    "run",
    "start",
    "stop",
    "restart",
    "kill",
    "plan",
    "review",
    "explain",
    "transform",
    "extract",
    "parse",
    "query",
    "monitor",
    "backup",
    "restore",
    "publish",
    "release",
    "install",
    "update",
    "open",
    "merge",
    "branch",
    "commit",
    "diff"
  ]);

  const filtered = tokens.filter((token) => !ignore.has(token) && token.length > 1);
  if (filtered.length === 0) {
    return "";
  }
  return titleCase(filtered.slice(0, 2).join(" "));
}

function ensureUniqueSpell(baseSpell, { usedSpells, qualifier, loreKeywords, profile, counterRef }) {
  let spell = baseSpell;
  if (!usedSpells.has(spell)) {
    usedSpells.add(spell);
    return spell;
  }

  const candidates = [];
  if (qualifier) {
    candidates.push(`${baseSpell} of ${qualifier}`);
  }

  for (const keyword of loreKeywords) {
    candidates.push(`${baseSpell} of ${keyword}`);
  }

  for (const suffix of profile.suffixes) {
    candidates.push(`${baseSpell} of ${suffix}`);
  }

  for (const candidate of candidates) {
    if (!usedSpells.has(candidate)) {
      usedSpells.add(candidate);
      return candidate;
    }
  }

  let attempt = 2;
  while (usedSpells.has(`${baseSpell} ${attempt}`)) {
    attempt += 1;
  }
  spell = `${baseSpell} ${attempt}`;
  usedSpells.add(spell);
  counterRef.value = attempt;
  return spell;
}

function buildSpellName(semantic, profile, loreKeywords, usedSpells) {
  const verb = profile.verbs[semantic.action] ?? profile.verbs.default;
  const object = profile.objects[semantic.target] ?? profile.objects.default;
  const baseSpell = titleCase(`${verb} ${object}`);
  const qualifier = pickQualifier(semantic.tokens);
  return ensureUniqueSpell(baseSpell, {
    usedSpells,
    qualifier,
    loreKeywords,
    profile,
    counterRef: { value: 0 }
  });
}

function pickIcon(semantic, profile) {
  return (
    profile.icons[semantic.action] ||
    profile.icons[semantic.target] ||
    profile.icons.default ||
    profile.fallbackIcon ||
    "✨"
  );
}

function generateMappings(skillIds, profile, loreKeywords) {
  const mappings = {};
  const usedSpells = new Set();

  for (const skillId of skillIds) {
    const semantic = classifySkillId(skillId);
    const spell = buildSpellName(semantic, profile, loreKeywords, usedSpells);
    const icon = pickIcon(semantic, profile);
    mappings[skillId] = { spell, icon };
  }

  return mappings;
}

function yamlQuote(value) {
  const stringValue = String(value ?? "");
  return `"${stringValue
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")}"`;
}

function toYamlDocument(doc) {
  const lines = [];
  lines.push(`theme: ${yamlQuote(doc.theme)}`);
  lines.push(`author: ${yamlQuote(doc.author)}`);
  lines.push(`description: ${yamlQuote(doc.description)}`);
  lines.push("mappings:");

  const skillIds = Object.keys(doc.mappings).sort();
  for (const skillId of skillIds) {
    const mapping = doc.mappings[skillId];
    lines.push(`  ${skillId}:`);
    lines.push(`    spell: ${yamlQuote(mapping.spell)}`);
    if (mapping.icon) {
      lines.push(`    icon: ${yamlQuote(mapping.icon)}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function summarizeSourceList(sources) {
  if (sources.length === 0) {
    return "fallback list";
  }
  if (sources.length === 1) {
    return sources[0];
  }
  return `${sources.slice(0, -1).join(" + ")} + ${sources[sources.length - 1]}`;
}

function buildDescription({ themeName, requestedTop, actualCount, loreMode, sourceNames }) {
  const lorePart =
    loreMode === "url"
      ? "page lore"
      : loreMode === "wikipedia"
        ? "Wikipedia lore"
        : "heuristic lore";

  return `${themeName} spell mappings for ${actualCount}/${requestedTop} popular skills, generated from ${summarizeSourceList(
    sourceNames
  )} with ${lorePart}.`;
}

function resolveOutputPath(explicitOutput, themeName) {
  if (explicitOutput) {
    return path.resolve(process.cwd(), explicitOutput);
  }

  const fileName = `${slugify(themeName)}.yaml`;
  return path.resolve(process.cwd(), FALLBACK_OUTPUT_DIR, fileName);
}

async function gatherPopularSkills(targetTop) {
  const fetchCount = Math.max(targetTop * 2, targetTop);
  const warnings = [];

  const [skillsShResult, clawhubResult] = await Promise.allSettled([
    fetchSkillsShTrending(fetchCount),
    fetchClawhubDownloads(fetchCount)
  ]);

  let skillsShItems = [];
  let clawhubItems = [];
  let clawhubApiUrl = "";
  const sourceNames = [];

  if (skillsShResult.status === "fulfilled") {
    skillsShItems = skillsShResult.value;
    sourceNames.push("skills.sh");
  } else {
    warnings.push(`skills.sh fetch failed: ${skillsShResult.reason?.message ?? String(skillsShResult.reason)}`);
  }

  if (clawhubResult.status === "fulfilled") {
    clawhubItems = clawhubResult.value.items;
    clawhubApiUrl = clawhubResult.value.apiUrl;
    sourceNames.push("clawhub");
  } else {
    warnings.push(`clawhub fetch failed: ${clawhubResult.reason?.message ?? String(clawhubResult.reason)}`);
  }

  const mergedSkillIds = mergePopularSkills({
    skillsShItems,
    clawhubItems,
    targetCount: targetTop
  });

  return {
    skillIds: mergedSkillIds,
    sourceNames,
    warnings,
    debug: {
      skillsShCount: skillsShItems.length,
      clawhubCount: clawhubItems.length,
      clawhubApiUrl
    }
  };
}

async function gatherLore(args) {
  const warnings = [];

  if (args.url) {
    try {
      const lore = await fetchLoreFromUrl(args.url);
      return { lore, warnings };
    } catch (error) {
      warnings.push(`URL lore fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (args.topic) {
    try {
      const lore = await fetchLoreFromWikipedia(args.topic);
      return { lore, warnings };
    } catch (error) {
      warnings.push(`Wikipedia summary fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return {
    lore: {
      mode: "heuristic",
      source: "",
      title: args.theme || args.topic || "",
      summary: "",
      text: args.theme || args.topic || args.url || "Custom theme"
    },
    warnings
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const [popular, loreResult] = await Promise.all([gatherPopularSkills(args.top), gatherLore(args)]);
  const lore = loreResult.lore;

  for (const warning of [...popular.warnings, ...loreResult.warnings]) {
    console.error(`Warning: ${warning}`);
  }

  const themeName = inferThemeName(args, lore);
  const profile = selectThemeProfile({
    themeName,
    loreText: lore.text,
    url: args.url
  });
  const loreKeywords = extractLoreKeywords(themeName, lore.text);

  const mappings = generateMappings(popular.skillIds, profile, loreKeywords);
  const description = buildDescription({
    themeName,
    requestedTop: args.top,
    actualCount: Object.keys(mappings).length,
    loreMode: lore.mode,
    sourceNames: popular.sourceNames
  });

  const outputPath = resolveOutputPath(args.output, themeName);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const yamlDocument = toYamlDocument({
    theme: themeName,
    author: args.author,
    description,
    mappings
  });

  await fs.writeFile(outputPath, yamlDocument, "utf8");

  const relativeOutput = path.relative(process.cwd(), outputPath) || path.basename(outputPath);
  console.log(`Generated ${Object.keys(mappings).length} mappings -> ${relativeOutput}`);
  console.log(`Theme: ${themeName} (${profile.id})`);
  console.log(`Popular skill sources: ${summarizeSourceList(popular.sourceNames)}${popular.sourceNames.length === 0 ? " (fallback only)" : ""}`);
  console.log(`Lore source: ${lore.mode}${lore.source ? ` (${lore.source})` : ""}`);
  if (popular.debug.clawhubApiUrl) {
    console.log(`ClawHub API: ${popular.debug.clawhubApiUrl}`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to generate spell mapping: ${message}`);
  process.exitCode = 1;
});
