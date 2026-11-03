import { beforeEach, describe, expect, it, vi } from "vitest";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
    clear: () => values.clear(),
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("localStorage", memoryStorage());
});

describe("items saved on the phone", () => {
  it("saves and unsaves garments and tailors separately", async () => {
    const { toggleSaved } = await import("@/lib/discover/saved");

    expect(toggleSaved("garments", "g1")).toBe(true);
    expect(toggleSaved("tailors", "t1")).toBe(true);
    expect(JSON.parse(localStorage.getItem("akiba:saved")!)).toEqual({
      garments: ["g1"],
      tailors: ["t1"],
    });

    expect(toggleSaved("garments", "g1")).toBe(false);
    expect(JSON.parse(localStorage.getItem("akiba:saved")!).garments).toEqual(
      [],
    );
  });

  it("puts the newest first and keeps at most 100", async () => {
    const { toggleSaved } = await import("@/lib/discover/saved");

    for (let index = 0; index < 105; index += 1) {
      toggleSaved("garments", `g${index}`);
    }
    const saved = JSON.parse(localStorage.getItem("akiba:saved")!).garments;
    expect(saved).toHaveLength(100);
    expect(saved[0]).toBe("g104");
  });

  it("ignores broken data left in the browser", async () => {
    localStorage.setItem("akiba:saved", "{not json");
    const { toggleSaved } = await import("@/lib/discover/saved");

    expect(toggleSaved("garments", "g1")).toBe(true);
    expect(JSON.parse(localStorage.getItem("akiba:saved")!).garments).toEqual([
      "g1",
    ]);
  });
});
