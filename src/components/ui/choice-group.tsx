import { cn } from "@/lib/cn";

type Option = {
  value: string;
  label: string;
};

type ChoiceGroupProps = {
  name: string;
  options: Option[];
  defaultValue?: string;
  invalid?: boolean;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

export function ChoiceGroup({
  name,
  options,
  defaultValue,
  invalid,
  ...aria
}: ChoiceGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-required="true"
      aria-invalid={invalid || undefined}
      tabIndex={invalid ? -1 : undefined}
      className={cn(
        "flex w-full gap-1 rounded-card bg-mist p-1",
        invalid && "ring-1 ring-danger",
      )}
      {...aria}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg px-2 text-sm font-medium text-prose transition-colors hover:text-ink has-checked:bg-white has-checked:font-semibold has-checked:text-ink has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-teal"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            defaultChecked={option.value === defaultValue}
            className="sr-only"
          />
          <span className="truncate">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
