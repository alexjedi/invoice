import { PlusIcon, TrashIcon, UploadIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { CURRENCIES, LOCALES } from "../state/defaults";
import { money, today, totals } from "../state/format";
import {
  addItem,
  patch,
  patchParty,
  removeItem,
  updateItem,
  useInvoice,
} from "../state/store";
import type { Invoice, Party, Status } from "../state/types";
import { ExportBar } from "./ExportBar";
import { IconButton, NumberField, Row, Section, Segmented, Select, Switch, TextArea, TextField, cx } from "./controls";

const TERMS = [0, 7, 15, 30];

export function Panel() {
  return (
    <aside className="scroll-thin flex w-full shrink-0 flex-col rounded-2xl bg-panel pb-4 md:w-[320px] md:overflow-y-auto">
      <ExportBar />
      <InvoiceSection />
      <PartySection who="from" />
      <PartySection who="to" />
      <ItemsSection />
      <TotalsSection />
      <NotesSection />
      <FormatSection />
    </aside>
  );
}

function InvoiceSection() {
  const inv = useInvoice((s) => s);
  return (
    <Section title="Invoice">
      <Row>
        <TextField label="Prefix" value={inv.prefix} onChange={(e) => patch({ prefix: e.target.value })} />
        <NumberField label="No." value={inv.number} onChange={(number) => patch({ number: Math.max(0, Math.round(number)) })} />
      </Row>
      <TextField label="Date" type="date" value={inv.date || today()} onChange={(e) => patch({ date: e.target.value })} />
      <div className="flex flex-col gap-1">
        <Segmented
          value={TERMS.includes(inv.terms) ? String(inv.terms) : "custom"}
          onChange={(v) => patch({ terms: v === "custom" ? 45 : +v })}
          options={[
            ...TERMS.map((d) => ({ value: String(d), label: d ? `Net ${d}` : "Receipt", title: d ? `Due in ${d} days` : "Due on receipt" })),
            { value: "custom", label: "…", title: "Custom" },
          ]}
        />
        {!TERMS.includes(inv.terms) && (
          <NumberField label="Due in" suffix="days" value={inv.terms} onChange={(terms) => patch({ terms: Math.max(0, Math.round(terms)) })} />
        )}
      </div>
      <Segmented<Status>
        value={inv.status}
        onChange={(status) => patch({ status })}
        options={[
          { value: "pending", label: "Pending" },
          { value: "paid", label: "Paid" },
          { value: "draft", label: "Draft" },
        ]}
      />
    </Section>
  );
}

function PartySection({ who }: { who: "from" | "to" }) {
  const p = useInvoice((s) => s[who]);
  const set = (k: keyof Party) => (e: { target: { value: string } }) => patchParty(who, { [k]: e.target.value });
  const isFrom = who === "from";

  return (
    <Section title={isFrom ? "From" : "Bill to"}>
      {isFrom && <LogoField />}
      <TextField label="Name" value={p.name} onChange={set("name")} placeholder={isFrom ? "Your name or company" : "Client"} />
      <TextArea label="Address" value={p.address} onChange={set("address")} placeholder={"Street\nCity, postcode\nCountry"} />
      <TextField label="Email" type="email" value={p.email} onChange={set("email")} placeholder="optional" />
      {isFrom && <TextField label="Phone" value={p.phone} onChange={set("phone")} placeholder="optional" />}
      <TextField label="Tax ID" value={p.taxId} onChange={set("taxId")} placeholder="optional" />
    </Section>
  );
}

function LogoField() {
  const logo = useInvoice((s) => s.logo);
  const shape = useInvoice((s) => s.logoShape);
  const input = useRef<HTMLInputElement>(null);

  const load = (file: File | undefined) => {
    if (!file?.type.startsWith("image/")) return;
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 400 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      patch({ logo: c.toDataURL(file.type === "image/jpeg" ? "image/jpeg" : "image/png", 0.9) });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => input.current?.click()}
        className="flex h-8 flex-1 cursor-pointer items-center gap-2 rounded-lg bg-field px-2.5 text-tx-2 transition-colors hover:bg-field-2 hover:text-tx"
      >
        {logo ? (
          <img src={logo} alt="" className={cx("size-5 object-cover", shape === "round" ? "rounded-full" : "rounded")} />
        ) : (
          <UploadIcon size={13} />
        )}
        {logo ? "Replace" : "Logo or photo"}
      </button>
      {logo && (
        <>
          <Segmented
            className="w-[108px]"
            value={shape}
            onChange={(logoShape) => patch({ logoShape })}
            options={[
              { value: "round", label: "Round" },
              { value: "square", label: "Logo" },
            ]}
          />
          <IconButton tip="Remove" onClick={() => patch({ logo: null })}>
            <XIcon size={13} />
          </IconButton>
        </>
      )}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => (load(e.target.files?.[0]), (e.target.value = ""))} />
    </div>
  );
}

function ItemsSection() {
  const items = useInvoice((s) => s.items);
  const inv = useInvoice((s) => s);
  return (
    <Section
      title="Items"
      action={
        <IconButton tip="Add item" className="-mr-1.5 size-6" onClick={addItem}>
          <PlusIcon size={12} />
        </IconButton>
      }
    >
      {items.map((i, n) => (
        <div key={i.id} className={cx("flex flex-col gap-1.5", n > 0 && "border-t border-field-2 pt-3")}>
          <div className="flex gap-1">
            <TextArea
              className="flex-1"
              label="Description"
              rows={1}
              value={i.description}
              onChange={(e) => updateItem(i.id, { description: e.target.value })}
              placeholder="What you did"
            />
            {items.length > 1 && (
              <IconButton tip="Remove item" onClick={() => removeItem(i.id)}>
                <TrashIcon size={13} />
              </IconButton>
            )}
          </div>
          <Row>
            <NumberField label="Qty" value={i.qty} onChange={(qty) => updateItem(i.id, { qty })} />
            <TextField label="Unit" value={i.unit} onChange={(e) => updateItem(i.id, { unit: e.target.value })} placeholder="hours" />
          </Row>
          <div className="flex items-center gap-1.5">
            <NumberField className="flex-1" label="Rate" value={i.rate} onChange={(rate) => updateItem(i.id, { rate })} />
            <span className="tabular w-[45%] truncate px-1 text-right text-tx-3">{money(i.qty * i.rate, inv)}</span>
          </div>
        </div>
      ))}
    </Section>
  );
}

function TotalsSection() {
  const inv = useInvoice((s) => s);
  const t = totals(inv);
  return (
    <Section title="Totals">
      <Select
        value={inv.currency}
        onChange={(currency) => patch({ currency })}
        options={CURRENCIES.map((c) => ({ value: c, label: c, hint: currencyName(c) }))}
      />
      <Row>
        <TextField label="Tax" value={inv.taxLabel} onChange={(e) => patch({ taxLabel: e.target.value })} placeholder="none" />
        <NumberField label="Rate" suffix="%" value={inv.taxRate} onChange={(taxRate) => patch({ taxRate })} />
      </Row>
      <NumberField label="Discount" suffix="%" value={inv.discount} onChange={(discount) => patch({ discount: Math.min(100, Math.max(0, discount)) })} />
      <div className="tabular flex justify-between px-1 pt-1 text-tx-2">
        <span>Total due</span>
        <span className="text-tx">{money(t.total, inv)}</span>
      </div>
    </Section>
  );
}

function NotesSection() {
  const notes = useInvoice((s) => s.notes);
  return (
    <Section title="Payment details">
      <TextArea
        label="Notes"
        rows={3}
        value={notes}
        onChange={(e) => patch({ notes: e.target.value })}
        placeholder={"Bank, IBAN, SWIFT, PayPal…\nLeave empty to hide"}
      />
    </Section>
  );
}

function FormatSection() {
  const inv = useInvoice((s) => s);
  const set = <K extends keyof Invoice>(k: K) => (v: Invoice[K]) => patch({ [k]: v } as Partial<Invoice>);
  return (
    <Section title="Format">
      <Select value={inv.locale} onChange={set("locale")} options={LOCALES} />
      <Segmented
        value={inv.currencyDisplay}
        onChange={set("currencyDisplay")}
        options={[
          { value: "code", label: money(1234.5, { ...inv, currencyDisplay: "code" }) },
          { value: "symbol", label: money(1234.5, { ...inv, currencyDisplay: "symbol" }) },
        ]}
      />
      <Switch label="Year in invoice number" checked={inv.yearInId} onChange={set("yearInId")} />
      <Switch label="Signature" checked={inv.signature} onChange={set("signature")} />
    </Section>
  );
}

function currencyName(code: string) {
  try {
    return new Intl.DisplayNames("en", { type: "currency" }).of(code) ?? "";
  } catch {
    return "";
  }
}
