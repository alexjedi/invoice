import { useSyncExternalStore } from "react";
import { DEFAULT_INVOICE, newItem, normalize } from "./defaults";
import type { Invoice, Item, Party } from "./types";

try {
  localStorage.removeItem("invoice.v1");
  localStorage.removeItem("theme");
} catch {}

let state = DEFAULT_INVOICE;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => (listeners.add(fn), () => listeners.delete(fn));
export const getInvoice = () => state;
export const isTouched = () => state !== DEFAULT_INVOICE;

export function useInvoice<T>(select: (s: Invoice) => T): T {
  return useSyncExternalStore(subscribe, () => select(state));
}

function set(next: Invoice) {
  state = next;
  listeners.forEach((fn) => fn());
}

export const patch = (p: Partial<Invoice>) => set({ ...state, ...p });
export const patchParty = (who: "from" | "to", p: Partial<Party>) => set({ ...state, [who]: { ...state[who], ...p } });

export const updateItem = (id: string, p: Partial<Item>) =>
  set({ ...state, items: state.items.map((i) => (i.id === id ? { ...i, ...p } : i)) });
export const addItem = () => set({ ...state, items: [...state.items, newItem()] });
export const removeItem = (id: string) =>
  state.items.length > 1 && set({ ...state, items: state.items.filter((i) => i.id !== id) });

export const nextInvoice = () => set({ ...state, number: state.number + 1, date: "", status: "pending" });

export const replaceInvoice = (raw: unknown) => set(normalize(raw));
export const resetInvoice = () => set(DEFAULT_INVOICE);
