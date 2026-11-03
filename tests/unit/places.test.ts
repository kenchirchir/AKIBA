import { describe, expect, it } from "vitest";
import { findCategory, findSubcategory } from "@/lib/catalogue";
import { areaNames, districts, findSector, sectorSlug } from "@/lib/kigali";

describe("Kigali districts and sectors", () => {
  it("has the three districts of Kigali", () => {
    expect(districts.map((district) => district.slug)).toEqual([
      "gasabo",
      "kicukiro",
      "nyarugenge",
    ]);
  });

  it("finds sectors only inside their own district", () => {
    const gasabo = districts[0];
    expect(findSector(gasabo, "kimironko")).toBe("Kimironko");
    expect(findSector(gasabo, "nyamirambo")).toBeUndefined();
  });

  it("shows names for stored codes", () => {
    expect(areaNames("gasabo", sectorSlug("Remera"))).toEqual({
      district: "Gasabo",
      sector: "Remera",
    });
  });
});

describe("garment categories", () => {
  it("only allows sub-categories that belong to the category", () => {
    const tops = findCategory("tops");
    expect(findSubcategory(tops, "shirts")).toBe("shirts");
    expect(findSubcategory(tops, "trousers")).toBeUndefined();
    expect(findCategory("shoes")).toBeUndefined();
  });
});
