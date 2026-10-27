import type { Invoice } from "./types";

export function today() {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, "0")).join("-");
}

export function invoiceId(inv: Invoice) {
  const year = (inv.date || today()).slice(0, 4);
  return [inv.prefix.trim(), inv.yearInId && year, inv.number].filter(Boolean).join("-");
}

export function dueDate(inv: Invoice) {
  const d = new Date((inv.date || today()) + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + inv.terms);
  return d.toISOString().slice(0, 10);
}

export function formatDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));
  } catch {
    return iso;
  }
}

export function money(amount: number, inv: Pick<Invoice, "currency" | "currencyDisplay" | "locale">) {
  try {
    if (inv.currencyDisplay === "symbol") {
      return new Intl.NumberFormat(inv.locale, { style: "currency", currency: inv.currency }).format(amount);
    }
    const n = new Intl.NumberFormat(inv.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    return `${inv.currency} ${n}`;
  } catch {
    return `${inv.currency} ${amount.toFixed(2)}`;
  }
}

export const plain = (n: number, locale: string) => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(n);

export function totals(inv: Invoice) {
  const subtotal = inv.items.reduce((s, i) => s + i.qty * i.rate, 0);
  const discount = (subtotal * inv.discount) / 100;
  const tax = ((subtotal - discount) * inv.taxRate) / 100;
  return { subtotal, discount, tax, total: subtotal - discount + tax };
}
