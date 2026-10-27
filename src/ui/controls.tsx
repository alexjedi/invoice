import { Select as BaseSelect } from "@base-ui/react/select";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Tooltip } from "@base-ui/react/tooltip";
import { motion } from "motion/react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useId, useState, type ComponentProps, type ReactNode } from "react";

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

export const spring = { type: "spring", stiffness: 520, damping: 40, mass: 0.8 } as const;

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 px-3 pt-4 pb-1">
      <div className="flex h-5 items-center justify-between px-1">
        <h2 className="text-[11px] tracking-[0.06em] text-tx-3 uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("grid grid-cols-2 gap-1.5", className)}>{children}</div>;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  reset?: number;
  format?: (v: number) => string;
  origin?: number;
}

export function Slider({ label, value, min, max, step = 0.01, onChange, reset, format, origin }: SliderProps) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const o = pct(origin ?? min);
  const p = pct(Math.min(max, Math.max(min, value)));
  const text = format ? format(value) : String(Math.round(value * 100) / 100);

  return (
    <BaseSlider.Root
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v as number)}
      className="w-full"
    >
      <BaseSlider.Control
        className="group relative flex h-8 w-full cursor-ew-resize touch-none overflow-hidden rounded-lg bg-field transition-colors select-none hover:bg-field-2"
        onDoubleClick={() => reset !== undefined && onChange(reset)}
      >
        <BaseSlider.Track className="h-full w-full">
          <div
            className="absolute inset-y-0 bg-field-2 transition-colors group-hover:bg-field-3"
            style={{ left: `${Math.min(o, p)}%`, width: `${Math.abs(p - o)}%` }}
          />
          <BaseSlider.Thumb
            aria-label={label}
            className="h-3.5 w-0.5 rounded-full bg-tx-2 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100 has-[:focus-visible]:opacity-100"
          />
        </BaseSlider.Track>
        <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-tx-2">{label}</span>
        <span className="tabular pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-tx-2">{text}</span>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: Array<{ value: T; label: ReactNode; title?: string }>;
  onChange: (v: T) => void;
  className?: string;
}

export function Segmented<T extends string>({ value, options, onChange, className }: SegmentedProps<T>) {
  const id = useId();
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(v) => v[0] && onChange(v[0] as T)}
      className={cx("flex h-8 gap-0.5 rounded-lg bg-field p-0.5", className)}
    >
      {options.map((o) => (
        <Toggle
          key={o.value}
          value={o.value}
          aria-label={o.title}
          title={o.title}
          className="relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 text-tx-2 transition-colors outline-none hover:text-tx data-pressed:text-tx"
        >
          {value === o.value && (
            <motion.span
              layoutId={id}
              transition={spring}
              className="absolute inset-0 rounded-md bg-bg-2 shadow-[0_1px_2px_color-mix(in_oklch,black_12%,transparent)] dark:bg-field-3 dark:shadow-none"
            />
          )}
          <span className="relative flex items-center gap-1.5">{o.label}</span>
        </Toggle>
      ))}
    </ToggleGroup>
  );
}

interface SelectProps<T extends string> {
  value: T;
  options: Array<{ value: T; label: string; icon?: ReactNode; hint?: string }>;
  onChange: (v: T) => void;
  className?: string;
}

export function Select<T extends string>({ value, options, onChange, className }: SelectProps<T>) {
  const current = options.find((o) => o.value === value);
  return (
    <BaseSelect.Root items={options} value={value} onValueChange={(v) => v && onChange(v as T)}>
      <BaseSelect.Trigger
        className={cx(
          "flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg bg-field px-2.5 text-left transition-colors outline-none hover:bg-field-2 data-popup-open:bg-field-2",
          className,
        )}
      >
        {current?.icon && <span className="text-tx-2">{current.icon}</span>}
        <BaseSelect.Value className="flex-1 truncate" />
        <BaseSelect.Icon className="text-tx-3">
          <ChevronDownIcon size={12} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="z-50 outline-none" sideOffset={6} alignItemWithTrigger={false}>
          <BaseSelect.Popup className={popupClass("min-w-(--anchor-width) p-1")}>
            <BaseSelect.List className="max-h-(--available-height) overflow-y-auto">
              {options.map((o) => (
                <BaseSelect.Item
                  key={o.value}
                  value={o.value}
                  className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 outline-none data-highlighted:bg-field-2"
                >
                  {o.icon && <span className="text-tx-2">{o.icon}</span>}
                  <BaseSelect.ItemText className="flex-1">{o.label}</BaseSelect.ItemText>
                  {o.hint && <span className="text-tx-3">{o.hint}</span>}
                  <BaseSelect.ItemIndicator className="text-tx-2">
                    <CheckIcon size={12} />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

export const popupClass = (extra = "") =>
  cx(
    "origin-(--transform-origin) rounded-xl bg-bg-2 text-tx shadow-pop outline-none transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0 dark:bg-ui",
    extra,
  );

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex h-8 cursor-pointer items-center justify-between rounded-lg bg-field px-2.5 text-tx-2 transition-colors hover:bg-field-2">
      {label}
      <BaseSwitch.Root
        checked={checked}
        onCheckedChange={onChange}
        className="relative flex h-4 w-7 rounded-full bg-field-3 p-0.5 transition-colors data-checked:bg-tx"
      >
        <BaseSwitch.Thumb className="size-3 rounded-full bg-bg shadow-sm transition-transform data-checked:translate-x-3" />
      </BaseSwitch.Root>
    </label>
  );
}

export function ColorField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <label className="flex h-8 cursor-pointer items-center gap-2 rounded-lg bg-field px-1.5 transition-colors hover:bg-field-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-5 shrink-0 rounded-md shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--color-tx)_12%,transparent)]"
      />
      {label && <span className="flex-1 text-tx-2">{label}</span>}
      <span className="tabular pr-1 text-tx-3 uppercase">{value.replace("#", "")}</span>
    </label>
  );
}

export function TextField(props: ComponentProps<"input"> & { label: string; suffix?: string }) {
  const { label, className, suffix, ...rest } = props;
  return (
    <label className={cx("flex h-8 items-center gap-2 rounded-lg bg-field px-2.5 transition-colors focus-within:bg-field-2 hover:bg-field-2", className)}>
      <span className="shrink-0 text-tx-2">{label}</span>
      <input {...rest} className="min-w-0 flex-1 bg-transparent text-right text-tx outline-none placeholder:text-tx-4" />
      {suffix && <span className="-ml-1 text-tx-3">{suffix}</span>}
    </label>
  );
}

export function IconButton({
  tip,
  children,
  className,
  active,
  ...rest
}: ComponentProps<"button"> & { tip: string; active?: boolean }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        {...rest}
        aria-label={tip}
        className={cx(
          "flex size-8 cursor-pointer items-center justify-center rounded-lg text-tx-2 transition-colors hover:bg-field-2 hover:text-tx disabled:pointer-events-none disabled:opacity-35",
          active && "bg-field-2 text-tx",
          className,
        )}
      >
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6} className="z-50">
          <Tooltip.Popup className={popupClass("px-2 py-1 text-xs text-tx-2")}>{tip}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function Button({ className, variant = "field", ...rest }: ComponentProps<"button"> & { variant?: "field" | "solid" | "ghost" }) {
  return (
    <button
      {...rest}
      className={cx(
        "flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 transition-[background-color,color,opacity,scale] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        variant === "field" && "bg-field text-tx hover:bg-field-2",
        variant === "solid" && "bg-tx text-bg hover:opacity-90",
        variant === "ghost" && "text-tx-2 hover:bg-field-2 hover:text-tx",
        className,
      )}
    />
  );
}

export function Tile({
  selected,
  label,
  children,
  onClick,
  className,
}: {
  selected?: boolean;
  label: string;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={cx("group flex cursor-pointer flex-col items-center gap-1.5 outline-none", className)}>
      <span
        className={cx(
          "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-field transition-[background-color,box-shadow] group-hover:bg-field-2 group-focus-visible:ring-2 group-focus-visible:ring-bl/60",
          selected && "bg-field-2 ring-[1.5px] ring-tx-2 ring-inset",
        )}
      >
        {children}
      </span>
      <span className={cx("text-xs transition-colors", selected ? "text-tx" : "text-tx-3 group-hover:text-tx-2")}>{label}</span>
    </button>
  );
}

export function TextArea(props: ComponentProps<"textarea"> & { label: string }) {
  const { label, className, ...rest } = props;
  return (
    <label className={cx("flex flex-col gap-1 rounded-lg bg-field px-2.5 py-2 transition-colors focus-within:bg-field-2 hover:bg-field-2", className)}>
      <span className="text-tx-2">{label}</span>
      <textarea
        rows={2}
        {...rest}
        className="field-sizing-content min-h-10 resize-none bg-transparent text-tx outline-none placeholder:text-tx-4"
      />
    </label>
  );
}

export function NumberField({
  value,
  onChange,
  label,
  className,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  className?: string;
  suffix?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    if (parseNum(draft) !== value) setDraft(String(value));
  }
  return (
    <TextField
      label={label}
      className={className}
      inputMode="decimal"
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        const n = parseNum(e.target.value);
        if (n !== null) onChange(n);
      }}
      onBlur={() => setDraft(String(value))}
      suffix={suffix}
    />
  );
}

function parseNum(s: string) {
  const t = s.trim().replace(",", ".");
  if (t === "") return 0;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
