import Link from "next/link";
import { Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import { Placeholder } from "./placeholder";

const samples = [1, 2, 3, 4, 5, 6, 7, 8];

export function SampleGarments() {
  const t = useTranslations("Feed");

  return (
    <div className="flex flex-col gap-6 pb-12 lg:gap-8 lg:pb-16">
      <Placeholder milestone={7} description={t("sampleNote")} />
      <ul className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-8">
        {samples.map((number) => (
          <li key={number}>
            <Link
              href="/garments/sample-garment"
              className="group flex flex-col gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              <span className="flex aspect-[3/4] items-center justify-center rounded-lg bg-surface text-muted transition-colors group-hover:bg-brand-50">
                <Shirt strokeWidth={1} className="size-10" />
              </span>
              <span className="text-label">
                {t("sampleGarment", { number })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
