"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Field } from "@/components/ui/field";
import { PinInput } from "@/components/ui/pin-input";

const tailoringTypes = [
  "Suit tailoring",
  "Traditional (Mushanana)",
  "Dressmaking",
];

export function ChipsDemo() {
  const [chips, setChips] = useState(tailoringTypes);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Chip
          key={chip}
          removeLabel={`Remove ${chip}`}
          onRemove={() => setChips(chips.filter((item) => item !== chip))}
        >
          {chip}
        </Chip>
      ))}
      {chips.length < tailoringTypes.length && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setChips(tailoringTypes)}
        >
          Reset
        </Button>
      )}
    </div>
  );
}

export function SheetDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="soft" onClick={() => setOpen(true)}>
        Open the Change PIN sheet
      </Button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Change PIN"
      >
        <p className="text-sm text-secondary">
          Use 5 digits only you know. You’ll use the new PIN the next time you
          log in.
        </p>
        <div className="mt-5 flex flex-col gap-4">
          <Field id="current-pin" label="Current PIN">
            {(control) => <PinInput {...control} />}
          </Field>
          <Field id="new-pin" label="New 5-digit PIN">
            {(control) => <PinInput {...control} autoComplete="new-password" />}
          </Field>
          <Field id="confirm-pin" label="Confirm new PIN">
            {(control) => <PinInput {...control} autoComplete="new-password" />}
          </Field>
          <Button fullWidth disabled className="mt-1">
            Update PIN
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
