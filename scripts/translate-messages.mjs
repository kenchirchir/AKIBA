import { readFile, writeFile } from "node:fs/promises";
import { parse, TYPE } from "@formatjs/icu-messageformat-parser";
import { printAST } from "@formatjs/icu-messageformat-parser/printer.js";

const endpoint = "https://translation.googleapis.com/language/translate/v2";
const target = "rw";
const sourceFile = new URL("../messages/en.json", import.meta.url);
const targetFile = new URL(`../messages/${target}.json`, import.meta.url);
const memoryFile = new URL(
  `../messages/${target}.source.json`,
  import.meta.url,
);
const keepEnglish = [
  "AKIBA",
  "Akiba",
  "Kigali",
  "Kitenge",
  "SMS",
  "PIN",
  "Kenneth Chirchir",
];
const keepWhole = [
  /^Metadata\.titleTemplate$/,
  /^RequestOptions\.sizes\.(?!measure)/,
];
const batchSize = 100;

const force = process.argv.includes("--force");
const key = process.env.GOOGLE_TRANSLATE_API_KEY;

if (!key) {
  console.error("Add GOOGLE_TRANSLATE_API_KEY to .env.local first.");
  process.exit(1);
}

async function readJson(url, fallback) {
  try {
    return JSON.parse(await readFile(url, "utf8"));
  } catch {
    return fallback;
  }
}

function flatten(object, prefix = "", result = {}) {
  for (const [name, value] of Object.entries(object)) {
    const path = prefix ? `${prefix}.${name}` : name;
    if (typeof value === "string") result[path] = value;
    else flatten(value, path, result);
  }
  return result;
}

function unflatten(flat) {
  const result = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split(".");
    let node = result;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) node[part] = value;
      else node = node[part] ??= /^\d+$/.test(parts[index + 1]) ? [] : {};
    });
  }
  return result;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function unescapeHtml(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

const keepPattern = new RegExp(
  `[\\w.+-]+@[\\w-]+\\.[\\w.]+|\\b(?:${keepEnglish.join("|")})\\b`,
  "g",
);

const queue = [];

function googleTranslate(html) {
  return new Promise((resolve, reject) => {
    queue.push({ html, resolve, reject });
    if (queue.length === 1) setImmediate(flush);
  });
}

async function flush() {
  const jobs = queue.splice(0, queue.length);
  for (let start = 0; start < jobs.length; start += batchSize) {
    const batch = jobs.slice(start, start + batchSize);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
        body: JSON.stringify({
          q: batch.map((job) => job.html),
          source: "en",
          target,
          format: "html",
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error?.message ?? `HTTP ${response.status}`);
      }
      body.data.translations.forEach((item, index) =>
        batch[index].resolve(item.translatedText),
      );
    } catch (error) {
      for (const job of batch) job.reject(error);
    }
  }
}

function slotTag(index) {
  return `<span class="notranslate" id="s${index}">${index}</span>`;
}

function toHtml(elements, slots) {
  return elements
    .map((element) => {
      switch (element.type) {
        case TYPE.literal:
          return escapeHtml(element.value)
            .replace(keepPattern, (word) => slotTag(slots.push(word) - 1))
            .replaceAll("&lt;", () => slotTag(slots.push("<") - 1));
        case TYPE.tag:
          return `<${element.value}>${toHtml(element.children, slots)}</${element.value}>`;
        case TYPE.pound:
          return slotTag(slots.push("#") - 1);
        default:
          return slotTag(slots.push(element) - 1);
      }
    })
    .join("");
}

function fromHtml(html, slots) {
  return unescapeHtml(
    html
      .replace(
        /<span[^>]*id="s(\d+)"[^>]*>.*?<\/span>/g,
        (_, index) => `\u0000${index}\u0000`,
      )
      .replace(/<([a-z]+)>(\s+)/g, "$2<$1>")
      .replace(/(\s+)<\/([a-z]+)>/g, "</$2>$1")
      .replace(/\(\s+/g, "(")
      .replace(/\s+([.,:;!?)])/g, "$1"),
  )
    .replaceAll("'", "’")
    .replace(/\u0000(\d+)\u0000/g, (_, index) => {
      const slot = slots[Number(index)];
      return typeof slot === "string" ? slot : printAST([slot]);
    });
}

async function translateOptions(elements) {
  for (const element of elements) {
    if (element.type === TYPE.plural || element.type === TYPE.select) {
      for (const option of Object.values(element.options)) {
        option.value = await translateElements(
          option.value,
          element.type === TYPE.plural,
        );
      }
    }
    if (element.type === TYPE.tag) await translateOptions(element.children);
  }
}

function parseText(text, inPlural) {
  if (!inPlural) return parse(text, { requiresOtherClause: false });
  const [plural] = parse(`{n, plural, other {${text}}}`);
  return plural.options.other.value;
}

function hasText(elements) {
  return elements.some(
    (element) =>
      (element.type === TYPE.literal && /[a-z]{2}/i.test(element.value)) ||
      (element.type === TYPE.tag && hasText(element.children)),
  );
}

async function translateElements(elements, inPlural = false) {
  await translateOptions(elements);
  if (!hasText(elements)) return elements;

  const slots = [];
  const html = toHtml(elements, slots);
  const translated = fromHtml(await googleTranslate(html), slots);
  return parseText(translated, inPlural);
}

function names(elements, found = new Set()) {
  for (const element of elements) {
    if (element.type === TYPE.tag) {
      found.add(`<${element.value}>`);
      names(element.children, found);
    } else if (element.type !== TYPE.literal && element.type !== TYPE.pound) {
      found.add(`{${element.value}}`);
      if (element.options) {
        for (const option of Object.values(element.options)) {
          names(option.value, found);
        }
      }
    }
  }
  return found;
}

async function translateMessage(message) {
  const original = parse(message, { requiresOtherClause: false });
  const translated = await translateElements(
    parse(message, { requiresOtherClause: false }),
  );
  const result = printAST(translated);
  const expected = [...names(original)].sort().join(" ");
  const actual = [...names(parse(result))].sort().join(" ");
  if (expected !== actual) {
    throw new Error(`placeholders changed (${expected} → ${actual})`);
  }
  return result;
}

const english = flatten(await readJson(sourceFile, {}));
const existing = flatten(await readJson(targetFile, {}));
const memory = await readJson(memoryFile, {});

const output = {};
const nextMemory = {};
const todo = [];

for (const [path, text] of Object.entries(english)) {
  if (keepWhole.some((pattern) => pattern.test(path))) {
    output[path] = text;
    nextMemory[path] = text;
  } else if (!force && existing[path] && memory[path] === text) {
    output[path] = existing[path];
    nextMemory[path] = text;
  } else {
    todo.push(path);
  }
}

console.log(
  `${Object.keys(english).length} messages, ${todo.length} to translate.`,
);

const failed = [];
await Promise.all(
  todo.map(async (path) => {
    try {
      output[path] = await translateMessage(english[path]);
      nextMemory[path] = english[path];
    } catch (error) {
      failed.push(`${path}: ${error.message}`);
      if (existing[path]) output[path] = existing[path];
    }
  }),
);

const ordered = Object.fromEntries(
  Object.keys(english)
    .filter((path) => path in output)
    .map((path) => [path, output[path]]),
);
const orderedMemory = Object.fromEntries(
  Object.keys(english)
    .filter((path) => path in nextMemory)
    .map((path) => [path, nextMemory[path]]),
);

await writeFile(targetFile, `${JSON.stringify(unflatten(ordered), null, 2)}\n`);
await writeFile(memoryFile, `${JSON.stringify(orderedMemory, null, 2)}\n`);

console.log(`Wrote messages/${target}.json.`);
if (failed.length > 0) {
  console.warn(
    `${failed.length} messages stay in English and need a human translation:\n${failed.join("\n")}`,
  );
  process.exitCode = 1;
}
