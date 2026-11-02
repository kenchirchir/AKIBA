import { CircleAlert } from "lucide-react";

export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-card bg-danger/10 px-3 py-3 text-sm text-danger"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}
