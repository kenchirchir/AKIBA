import type { ListedTailor } from "@/lib/tailors";
import { SaveTailorButton } from "./save-tailor-button";
import { TailorCard } from "./tailor-card";

export function TailorList({ tailors }: { tailors: ListedTailor[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tailors.map((tailor) => (
        <li key={tailor.id} className="relative">
          <TailorCard tailor={tailor} />
          <SaveTailorButton
            tailorId={tailor.id}
            shopName={tailor.shop_name}
            className="absolute top-4 right-4"
          />
        </li>
      ))}
    </ul>
  );
}
