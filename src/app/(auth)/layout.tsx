import type { ReactNode } from "react";
import Image from "next/image";
import heroImage from "@/assets/welcome-hero.jpg";
import { DecorativeCircles } from "@/components/layout/decorative-circles";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1">
      <div className="relative hidden flex-1 bg-brand md:block">
        <Image
          src={heroImage}
          alt=""
          fill
          placeholder="blur"
          sizes="50vw"
          className="object-cover"
        />
      </div>
      <div className="relative flex flex-1 flex-col overflow-hidden px-6 pt-36 pb-10 md:items-center md:justify-center md:px-10 md:py-16">
        <DecorativeCircles />
        <div className="relative w-full md:max-w-md">{children}</div>
      </div>
    </main>
  );
}
