export interface Party {
  name: string;
  address: string;
  email: string;
  phone: string;
  taxId: string;
}

export interface Item {
  id: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
}

export type Status = "pending" | "paid" | "draft";
export type CurrencyDisplay = "code" | "symbol";
export type LogoShape = "round" | "square";

export interface Invoice {
  prefix: string;
  number: number;
  yearInId: boolean;
  date: string;
  terms: number;
  status: Status;

  from: Party;
  to: Party;
  items: Item[];

  currency: string;
  currencyDisplay: CurrencyDisplay;
  locale: string;
  taxLabel: string;
  taxRate: number;
  discount: number;

  notes: string;
  logo: string | null;
  logoShape: LogoShape;
  signature: boolean;
}
