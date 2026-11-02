export type District = {
  slug: string;
  name: string;
  sectors: readonly string[];
};

export const districts: readonly District[] = [
  {
    slug: "gasabo",
    name: "Gasabo",
    sectors: [
      "Bumbogo",
      "Gatsata",
      "Gikomero",
      "Gisozi",
      "Jabana",
      "Jali",
      "Kacyiru",
      "Kimihurura",
      "Kimironko",
      "Kinyinya",
      "Ndera",
      "Nduba",
      "Remera",
      "Rusororo",
      "Rutunga",
    ],
  },
  {
    slug: "kicukiro",
    name: "Kicukiro",
    sectors: [
      "Gahanga",
      "Gatenga",
      "Gikondo",
      "Kagarama",
      "Kanombe",
      "Kicukiro",
      "Kigarama",
      "Masaka",
      "Niboye",
      "Nyarugunga",
    ],
  },
  {
    slug: "nyarugenge",
    name: "Nyarugenge",
    sectors: [
      "Gitega",
      "Kanyinya",
      "Kigali",
      "Kimisagara",
      "Mageragere",
      "Muhima",
      "Nyakabanda",
      "Nyamirambo",
      "Nyarugenge",
      "Rwezamenyo",
    ],
  },
];

export function sectorSlug(name: string) {
  return name.toLowerCase();
}

export function findDistrict(slug: string | undefined) {
  return districts.find((district) => district.slug === slug);
}

export function findSector(
  district: District | undefined,
  slug: string | undefined,
) {
  return district?.sectors.find((name) => sectorSlug(name) === slug);
}
