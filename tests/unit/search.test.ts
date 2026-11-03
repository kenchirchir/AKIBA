import { describe, expect, it } from "vitest";
import { searchText } from "@/lib/discover/search";

describe("search words", () => {
  it("keeps up to five words of three letters or more", () => {
    expect(searchText("Kitenge wrap dress for a wedding")).toEqual([
      "kitenge",
      "wrap",
      "dress",
      "wedding",
    ]);
  });

  it("drops filler words and punctuation", () => {
    expect(searchText("The suit, with linen; from Uwase!")).toEqual([
      "suit",
      "linen",
      "uwase",
    ]);
  });

  it("keeps letters with accents and apostrophes", () => {
    expect(searchText("Kids' wear à Kigali")).toEqual([
      "kids'",
      "wear",
      "kigali",
    ]);
  });

  it("stops at five words", () => {
    expect(searchText("one two three four five six seven")).toHaveLength(5);
  });

  it("returns nothing for symbols that could break a database filter", () => {
    expect(searchText("%,() ")).toEqual([]);
  });
});
