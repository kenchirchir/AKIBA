import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

type FormState<Key extends string> = {
  errors?: Partial<Record<string, Key>>;
};

export function useActionForm<Key extends string, State extends FormState<Key>>(
  action: (state: Awaited<State>, formData: FormData) => Promise<State>,
  initialState: Awaited<State>,
  message: (key: Key, state: Awaited<State>) => string,
) {
  const [state, dispatch, pending] = useActionState(action, initialState);
  const [edited, setEdited] = useState({ state, fields: [] as string[] });
  const formRef = useRef<HTMLFormElement>(null);
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
    return key ? message(key, state) : undefined;
  }

  return { formRef, onSubmit, onChange, error, pending };
}
