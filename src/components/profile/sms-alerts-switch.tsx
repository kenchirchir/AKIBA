"use client";

import { useOptimistic, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setSmsAlerts } from "@/lib/profile/actions";

export function SmsAlertsSwitch({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  const [, startTransition] = useTransition();
  const [on, setOn] = useOptimistic(enabled);

  return (
    <Switch
      label={label}
      checked={on}
      className="flex-1"
      onChange={(event) => {
        const next = event.target.checked;
        startTransition(async () => {
          setOn(next);
          await setSmsAlerts(next);
        });
      }}
    />
  );
}
