import type { ReactNode } from "react";
import { logOut } from "@/lib/auth/actions";

type LogoutButtonProps = {
  className?: string;
  children: ReactNode;
};

export function LogoutButton({ className, children }: LogoutButtonProps) {
  return (
    <form action={logOut} className="contents">
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
