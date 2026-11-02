import { useSyncExternalStore } from "react";

type SavedKind = "garments" | "tailors";

export type SavedItems = Record<SavedKind, string[]>;

const storageKey = "akiba:saved";
const maxItems = 100;
const empty: SavedItems = { garments: [], tailors: [] };
const listeners = new Set<() => void>();
let current: SavedItems | null = null;

function ids(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .slice(0, maxItems)
    : [];
}

function load(): SavedItems {
  try {
    const items: unknown = JSON.parse(
      localStorage.getItem(storageKey) ?? "null",
    );
    if (!items || typeof items !== "object") return empty;

    const { garments, tailors } = items as Partial<Record<SavedKind, unknown>>;
    return { garments: ids(garments), tailors: ids(tailors) };
  } catch {
    return empty;
  }
}

function snapshot() {
  current ??= load();
  return current;
}

function serverSnapshot() {
  return empty;
}

function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key !== storageKey) return;
    current = null;
    listener();
  }

  listeners.add(listener);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSaved() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function toggleSaved(kind: SavedKind, id: string) {
  const items = snapshot();
  const saved = items[kind].includes(id);

  current = {
    ...items,
    [kind]: saved
      ? items[kind].filter((item) => item !== id)
      : [id, ...items[kind]].slice(0, maxItems),
  };
  persist(current);
  for (const listener of listeners) listener();

  return !saved;
}

function persist(items: SavedItems) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
