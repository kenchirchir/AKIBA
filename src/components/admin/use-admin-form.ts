import { useTranslations } from "next-intl";
import { useActionForm } from "@/components/forms/use-action-form";
import type { AdminErrorKey, AdminFormState } from "@/lib/admin/errors";

type AdminAction = (
  state: AdminFormState,
  formData: FormData,
) => Promise<AdminFormState>;

export function useAdminForm(action: AdminAction) {
  const t = useTranslations("Admin.errors");

  return useActionForm(action, {}, (key: AdminErrorKey) => t(key));
}
