import { useTranslations } from "next-intl";
import { useActionForm } from "@/components/forms/use-action-form";
import type { AuthErrorKey, AuthFormState } from "@/lib/auth/errors";

type AuthAction = (
  state: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;

export function useAuthForm(action: AuthAction) {
  const t = useTranslations("Auth.errors");

  return useActionForm(action, {}, (key: AuthErrorKey, state) =>
    t(key, { minutes: state.minutes ?? 15 }),
  );
}
