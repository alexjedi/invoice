import type { Invoice, Item, Party } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const EMPTY_PARTY: Party = { name: "", address: "", email: "", phone: "", taxId: "" };

export const newItem = (): Item => ({ id: uid(), description: "", qty: 1, unit: "hours", rate: 0 });

export const DEFAULT_INVOICE: Invoice = {
  prefix: "INV",
  number: 1,
  yearInId: true,
  date: "",
  terms: 15,
  status: "pending",

  from: EMPTY_PARTY,
  to: EMPTY_PARTY,
  items: [{ id: "first", description: "", qty: 1, unit: "hours", rate: 0 }],

  currency: "USD",
  currencyDisplay: "code",
  locale: "en-US",
  taxLabel: "VAT",
  taxRate: 0,
  discount: 0,

  notes: "",
  logo: null,
  logoShape: "round",
  signature: true,
};

export const CURRENCIES = ["USD", "EUR", "GBP", "CHF", "CAD", "AUD", "NZD", "JPY", "SEK", "NOK", "DKK", "PLN", "CZK", "BRL", "INR", "SGD", "AED", "UAH"];

export const LOCALES = [
  { value: "en-US", label: "1,234.56 · March 3, 2026" },
  { value: "en-GB", label: "1,234.56 · 3 March 2026" },
  { value: "de-DE", label: "1.234,56 · 3. März 2026" },
  { value: "fr-FR", label: "1 234,56 · 3 mars 2026" },
  { value: "pt-PT", label: "1234,56 · 3 de março de 2026" },
  { value: "es-ES", label: "1234,56 · 3 de marzo de 2026" },
  { value: "ja-JP", label: "1,234.56 · 2026年3月3日" },
];

const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const text = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
const lines = (v: unknown) => (Array.isArray(v) ? v.filter((l) => typeof l === "string").join("\n") : text(v, ""));

function party(raw: unknown, fallback: Party): Party {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  return {
    name: text(r.name ?? r.company, ""),
    address: lines(r.address),
    email: text(r.email, ""),
    phone: text(r.phone, ""),
    taxId: text(r.taxId ?? r.tax_id, ""),
  };
}

function item(raw: unknown): Item | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    id: text(r.id, uid()),
    description: text(r.description, ""),
    qty: num(r.qty, 1),
    unit: text(r.unit, ""),
    rate: num(r.rate, 0),
  };
}

export function normalize(raw: unknown): Invoice {
  if (!raw || typeof raw !== "object") return DEFAULT_INVOICE;
  const r = raw as Record<string, unknown>;
  const d = DEFAULT_INVOICE;

  const rawItems = Array.isArray(r.items) ? r.items : r.line_item ? [r.line_item] : null;
  const items = rawItems?.map(item).filter((i): i is Item => !!i);

  const pick = <T,>(v: T | undefined, ok: boolean, fallback: T) => (ok ? (v as T) : fallback);
  return {
    prefix: text(r.prefix ?? r.invoice_prefix, d.prefix),
    number: num(r.number ?? r.next_number, d.number),
    yearInId: typeof r.yearInId === "boolean" ? r.yearInId : d.yearInId,
    date: text(r.date, ""),
    terms: num(r.terms, d.terms),
    status: pick(r.status as Invoice["status"], ["pending", "paid", "draft"].includes(r.status as string), d.status),
    from: party(r.from ?? r.bill_from, d.from),
    to: party(r.to ?? r.bill_to, d.to),
    items: items?.length ? items : d.items,
    currency: text(r.currency, d.currency),
    currencyDisplay: pick(r.currencyDisplay as Invoice["currencyDisplay"], r.currencyDisplay === "symbol", "code"),
    locale: text(r.locale, d.locale),
    taxLabel: text(r.taxLabel, d.taxLabel),
    taxRate: num(r.taxRate, d.taxRate),
    discount: num(r.discount, d.discount),
    notes: text(r.notes, d.notes),
    logo: typeof r.logo === "string" && r.logo.startsWith("data:image/") ? r.logo : null,
    logoShape: pick(r.logoShape as Invoice["logoShape"], r.logoShape === "square", "round"),
    signature: typeof r.signature === "boolean" ? r.signature : d.signature,
  };
}
