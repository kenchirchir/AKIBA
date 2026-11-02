import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useTranslations } from "next-intl";
import type { AuthFormState } from "@/lib/auth/errors";

type AuthAction = (
  state: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;

export function useAuthForm(action: AuthAction) {
  const [state, dispatch, pending] = useActionState(action, {});
  const [edited, setEdited] = useState({ state, fields: [] as string[] });
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations("Auth.errors");
  const fields = edited.state === state ? edited.fields : [];

  useEffect(() => {
    if (!state.errors) return;
    const target =
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']") ??
      formRef.current?.querySelector<HTMLElement>("[role='alert']");
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
    target?.focus({ preventScroll: true });
  }, [state]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  function onChange(event: FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement;
    const field =
      target.closest<HTMLElement>("[data-field]")?.dataset.field ?? target.name;

    if (state.errors?.[field] && !fields.includes(field)) {
      setEdited({ state, fields: [...fields, field] });
    }
  }

  function error(field: string) {
    const key = fields.includes(field) ? undefined : state.errors?.[field];
    return key ? t(key, { minutes: state.minutes ?? 15 }) : undefined;
  }

  return { formRef, onSubmit, onChange, error, pending };
}
