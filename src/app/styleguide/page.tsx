import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ChevronLeft, Heart, Phone, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { OtpInput } from "@/components/ui/otp-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { PinInput } from "@/components/ui/pin-input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VerifiedBadge, VerifiedIcon } from "@/components/ui/verified";
import { cn } from "@/lib/cn";
import { ChipsDemo, SheetDemo } from "./demos";

export const metadata: Metadata = {
  title: "Style guide · AKIBA",
  robots: { index: false, follow: false },
};

const colours = [
  { name: "ink", hex: "#0B1B3F", swatch: "bg-ink" },
  { name: "ink-soft", hex: "#13304A", swatch: "bg-ink-soft" },
  { name: "prose", hex: "#2B3A5C", swatch: "bg-prose" },
  { name: "secondary", hex: "#4A5878", swatch: "bg-secondary" },
  { name: "muted", hex: "#8A96B2", swatch: "bg-muted" },
  { name: "placeholder", hex: "#9AA4B5", swatch: "bg-placeholder" },
  { name: "brand", hex: "#09B4D3", swatch: "bg-brand" },
  { name: "brand-light", hex: "#3CC4DD", swatch: "bg-brand-light" },
  { name: "brand-50", hex: "#E6F7FB", swatch: "bg-brand-50" },
  { name: "brand-100", hex: "#CDEFF6", swatch: "bg-brand-100" },
  { name: "teal", hex: "#067A96", swatch: "bg-teal" },
  { name: "teal-dark", hex: "#056377", swatch: "bg-teal-dark" },
  { name: "line", hex: "#D9DFE8", swatch: "bg-line" },
  { name: "line-soft", hex: "#E6EAF0", swatch: "bg-line-soft" },
  { name: "surface", hex: "#F4F6F9", swatch: "bg-surface" },
  { name: "mist", hex: "#F1F3F6", swatch: "bg-mist" },
  { name: "haze", hex: "#F5F8FE", swatch: "bg-haze" },
  { name: "track", hex: "#EEF1F5", swatch: "bg-track" },
  { name: "danger", hex: "#C8102E", swatch: "bg-danger" },
  { name: "alert", hex: "#E0123C", swatch: "bg-alert" },
  { name: "success", hex: "#2E9E62", swatch: "bg-success" },
  { name: "success-50", hex: "#E7F6EE", swatch: "bg-success-50" },
  { name: "warning-ink", hex: "#8A4B00", swatch: "bg-warning-ink" },
  { name: "warning-50", hex: "#FFF3E0", swatch: "bg-warning-50" },
];

const textStyles = [
  {
    name: "display · 28",
    className: "text-display",
    sample: "Clothes made in Kigali",
  },
  { name: "title · 24", className: "text-title", sample: "Kitenge wrap dress" },
  {
    name: "heading · 22",
    className: "text-heading",
    sample: "Request this garment",
  },
  {
    name: "subheading · 19",
    className: "text-subheading",
    sample: "Change PIN",
  },
  { name: "section · 17", className: "text-section", sample: "The story" },
  {
    name: "body · 15",
    className: "text-body text-prose",
    sample: "I made this dress after my mother’s market stall closed.",
  },
  { name: "label · 13", className: "text-label", sample: "Phone number" },
  {
    name: "caption · 12",
    className: "text-caption text-secondary",
    sample: "We’ll text a code to verify it.",
  },
  {
    name: "micro · 11",
    className: "text-micro tracking-[0.16em] text-secondary uppercase",
    sample: "All garments · Kigali",
  },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-line-soft pt-6">
      <h2 className="text-section">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleGuidePage() {
  return (
    <main className="mx-auto flex w-full max-w-[390px] flex-col gap-8 px-5 py-8">
      <header className="flex flex-col gap-4">
        <Logo />
        <div>
          <h1 className="text-title">Style guide</h1>
          <p className="mt-1 text-body text-secondary">
            Colours, text styles and components used across AKIBA.
          </p>
        </div>
      </header>

      <Section title="Logo">
        <div className="flex flex-wrap items-center gap-4">
          <Logo />
          <Logo variant="block" />
        </div>
      </Section>

      <Section title="Colours">
        <ul className="grid grid-cols-2 gap-3">
          {colours.map((colour) => (
            <li key={colour.name} className="flex items-center gap-3">
              <span
                className={cn(
                  "size-10 shrink-0 rounded-lg border border-line-soft",
                  colour.swatch,
                )}
              />
              <span className="flex flex-col">
                <span className="text-label">{colour.name}</span>
                <span className="text-caption text-secondary">
                  {colour.hex}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Text styles · Outfit">
        <ul className="flex flex-col gap-4">
          {textStyles.map((style) => (
            <li key={style.name} className="flex flex-col gap-1">
              <span className="text-caption text-muted">{style.name}</span>
              <span className={style.className}>{style.sample}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-col gap-3">
          <Button fullWidth>Sign up</Button>
          <Button variant="dark" size="lg" fullWidth>
            Discover garments
          </Button>
          <Button variant="outline" size="lg" fullWidth>
            I’m a tailor — join AKIBA
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button>Send request</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:+250794096359"
              className={buttonClasses({ size: "sm" })}
            >
              <Phone />
              0794 096 359
            </a>
            <Button variant="outline" size="sm">
              Mark as ordered
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="soft" size="sm">
              Edit profile
            </Button>
            <Button variant="ghost" size="sm">
              Mark all as read
            </Button>
          </div>
          <Button fullWidth disabled>
            Update PIN
          </Button>
        </div>
      </Section>

      <Section title="Icon buttons">
        <div className="flex flex-wrap items-center gap-3">
          <IconButton label="Back" shape="square">
            <ChevronLeft />
          </IconButton>
          <IconButton label="Close" size="sm">
            <X />
          </IconButton>
          <IconButton label="Save garment" variant="outline" size="lg">
            <Heart />
          </IconButton>
          <IconButton label="Saved" variant="brand" size="lg">
            <Heart className="fill-brand text-brand" />
          </IconButton>
        </div>
      </Section>

      <Section title="Form fields">
        <div className="flex flex-col gap-4">
          <Field id="full-name" label="Full name" required>
            {(control) => <Input {...control} placeholder="e.g. Aline Uwase" />}
          </Field>
          <Field
            id="phone"
            label="Phone number"
            required
            hint="We’ll text a code to verify it."
          >
            {(control) => <PhoneInput {...control} />}
          </Field>
          <Field id="pin" label="Create a 5-digit PIN" required>
            {(control) => <PinInput {...control} autoComplete="new-password" />}
          </Field>
          <Field id="code" label="Verification code" required>
            {(control) => <OtpInput {...control} />}
          </Field>
          <Field id="district" label="District in Kigali" required>
            {(control) => (
              <Select {...control} defaultValue="">
                <option value="" disabled>
                  Choose a district
                </option>
                <option>Gasabo</option>
                <option>Kicukiro</option>
                <option>Nyarugenge</option>
              </Select>
            )}
          </Field>
          <Field id="story" label="The story behind it">
            {(control) => (
              <Textarea
                {...control}
                placeholder="What inspired it? What does the fabric or style mean? How did you make it?"
              />
            )}
          </Field>
          <Field
            id="phone-error"
            label="Phone number"
            required
            error="Enter a 9-digit Rwandan number."
          >
            {(control) => <PhoneInput {...control} defaultValue="78 123" />}
          </Field>
        </div>
      </Section>

      <Section title="Checkbox and switch">
        <div className="flex flex-col gap-4">
          <Checkbox label="Remember me" defaultChecked />
          <Checkbox label="I have read and agree to the terms & conditions" />
          <Switch label="SMS alerts for new requests" defaultChecked />
          <Switch label="Show price & tailor" />
        </div>
      </Section>

      <Section title="Chips and badges">
        <ChipsDemo />
        <div className="flex flex-wrap gap-2">
          <Chip variant="pill">Dressmaking</Chip>
          <Chip variant="pill">Kitenge / Ankara</Chip>
          <Chip variant="pill">Bridal & occasion</Chip>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Verified</Badge>
          <Badge variant="success">Live</Badge>
          <Badge variant="warning">In review</Badge>
          <Badge variant="neutral">Experienced · 9 yrs 4 mos</Badge>
          <Badge variant="outline">Master tailor</Badge>
          <Badge variant="count">11</Badge>
        </div>
      </Section>

      <Section title="Avatars and verification">
        <div className="flex items-center gap-3">
          <Avatar name="Aline Uwase" size="xl" />
          <Avatar name="Aline Uwase" size="lg" />
          <Avatar name="Mugisha Tailors" />
          <Avatar name="Keza Traditional" size="sm" />
          <Avatar name="Ineza Atelier" size="xs" />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-section">
            Uwase Couture
            <VerifiedIcon />
          </span>
          <VerifiedBadge />
        </div>
      </Section>

      <Section title="Cards and progress">
        <Card className="flex flex-col gap-1 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body font-semibold">Keza Muthoni</h3>
            <span className="text-caption font-medium text-secondary">
              12 sec
            </span>
          </div>
          <p className="text-caption text-secondary">
            2 × Kitenge wrap dress · Size M · needed by 15 Nov
          </p>
        </Card>
        <Card className="flex flex-col gap-3 p-4">
          <p className="text-sm font-medium">Your profile is 80% complete</p>
          <ProgressBar value={80} label="Profile completeness" />
        </Card>
      </Section>

      <Section title="Segmented controls">
        <SegmentedControl
          label="Filter requests"
          defaultValue="all"
          options={[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread", count: 11 },
          ]}
        />
        <SegmentedControl
          label="Saved items"
          defaultValue="garments"
          fullWidth
          options={[
            { value: "garments", label: "Garments (4)" },
            { value: "tailors", label: "Tailors (2)" },
          ]}
        />
      </Section>

      <Section title="Bottom sheet">
        <SheetDemo />
      </Section>
    </main>
  );
}
