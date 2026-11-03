import "server-only";
import { cookies } from "next/headers";
import { seal, unseal } from "./seal";
import type { ShopDetails } from "./validation";

export type PendingSignUp = {
  phone: string;
  password?: string;
  details?: ShopDetails;
};

export type PendingReset = {
  phone: string;
};

export function pendingCookie<T>(name: string) {
  return {
    async read() {
      return unseal<T>((await cookies()).get(name)?.value);
    },
    async save(value: T) {
      (await cookies()).set(name, seal(value), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 30,
      });
    },
    async clear() {
      (await cookies()).delete(name);
    },
  };
}

export const pendingSignUp = pendingCookie<PendingSignUp>("akiba_signup");

export const pendingReset = pendingCookie<PendingReset>("akiba_reset");
