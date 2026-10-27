import { uid } from "./defaults";
import { getInvoice, replaceInvoice } from "./store";
import type { Invoice, Item, Party } from "./types";

const PARTY_KEYS: Record<string, keyof Party> = {
  name: "name",
  address: "address",
  email: "email",
  phone: "phone",
  tax: "taxId",
  taxid: "taxId",
};

export function applyLink() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  try {
    const next = parse(hash, getInvoice());
    if (next) replaceInvoice(next);
  } catch {
  }
}

function parse(hash: string, cur: Invoice): Invoice | null {
  const params = new URLSearchParams(hash);

  const json = params.get("json");
  if (json) {
    const j = JSON.parse(json) as Partial<Invoice>;
    return {
      ...cur,
      ...j,
      from: { ...cur.from, ...j.from },
      to: { ...cur.to, ...j.to },
    };
  }

  const inv: Invoice = { ...cur, from: { ...cur.from }, to: { ...cur.to } };
  const items: Item[] = [];
  let touched = false;

  for (const [rawKey, rawValue] of params) {
    const key = rawKey.toLowerCase();
    const v = rawValue.replace(/\\n/g, "\n").trim();
    const n = num(v, NaN);

    const [who, field] = key.split(".");
    if ((who === "from" || who === "to") && field && PARTY_KEYS[field]) {
      inv[who][PARTY_KEYS[field]] = v;
      touched = true;
      continue;
    }

    switch (key) {
      case "item": {
        const [description = "", qty = "1", unit = "", rate = "0"] = v.split("|").map((s) => s.trim());
        items.push({ id: uid(), description, qty: num(qty, 1), unit, rate: num(rate, 0) });
        break;
      }
      case "prefix":
        inv.prefix = v;
        break;
      case "number":
        if (Number.isInteger(n) && n >= 0) inv.number = n;
        break;
      case "date":
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) inv.date = v;
        break;
      case "terms":
        if (Number.isInteger(n) && n >= 0) inv.terms = n;
        break;
      case "status":
        if (v === "pending" || v === "paid" || v === "draft") inv.status = v;
        break;
      case "currency":
        if (/^[a-z]{3}$/i.test(v)) inv.currency = v.toUpperCase();
        break;
      case "display":
        if (v === "code" || v === "symbol") inv.currencyDisplay = v;
        break;
      case "locale":
        inv.locale = v;
        break;
      case "tax": {
        const [a, b] = v.split(":");
        if (b !== undefined) (inv.taxLabel = a.trim()), (inv.taxRate = num(b, 0));
        else if (/^[\d.,\s%]+$/.test(v)) inv.taxRate = n;
        else inv.taxLabel = v;
        break;
      }
      case "discount":
        if (Number.isFinite(n)) inv.discount = Math.min(100, Math.max(0, n));
        break;
      case "notes":
        inv.notes = v;
        break;
      case "signature":
        inv.signature = v !== "0" && v !== "false";
        break;
      case "year":
        inv.yearInId = v !== "0" && v !== "false";
        break;
      default:
        continue;
    }
    touched = true;
  }

  if (items.length) inv.items = items;
  return touched ? inv : null;
}

function num(s: string, fallback: number) {
  let t = s.replace(/[^\d.,-]/g, "");
  t = t.includes(".") ? t.replace(/,/g, "") : t.replace(",", ".");
  const n = Number(t);
  return t && Number.isFinite(n) ? n : fallback;
}
