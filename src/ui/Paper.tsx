import { useInvoice } from "../state/store";
import { dueDate, formatDate, invoiceId, money, plain, today, totals } from "../state/format";
import type { Invoice, Party } from "../state/types";
import { cx } from "./controls";

export function Paper({ preview }: { preview?: boolean }) {
  const inv = useInvoice((s) => s);
  const t = totals(inv);
  const date = inv.date || today();
  const fmt = (n: number) => money(n, inv);

  return (
    <div
      className="relative flex h-[297mm] w-[210mm] flex-col bg-white px-[12mm] pt-[11mm] text-[8pt] leading-[1.45] text-[#1a1a1a] [print-color-adjust:exact]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <header className="flex items-start justify-between">
        <div className="flex max-w-[95mm] flex-col gap-[9mm] pt-[1mm]">
          {inv.logo && (
            <img
              src={inv.logo}
              alt=""
              className={cx(
                "h-[11mm]",
                inv.logoShape === "round" ? "w-[11mm] rounded-full object-cover" : "max-w-[45mm] object-contain object-left",
              )}
            />
          )}
          <PartyBlock title="Bill To:" party={inv.to} hint={preview ? TO_HINT : undefined} detailed />
        </div>
        <div className="w-[63mm] shrink-0">
          <div className="mb-[4.5mm] bg-[#e4e4e4] py-[1.8mm] text-center text-[8pt] tracking-[0.42em]">INVOICE</div>
          <Meta label="#">{invoiceId(inv)}</Meta>
          <Meta label="Status">{inv.status}</Meta>
          <Meta label="Invoice date">{formatDate(date, inv.locale)}</Meta>
          <Meta label="Due date">{inv.terms ? formatDate(dueDate(inv), inv.locale) : "On receipt"}</Meta>
          <Meta label="Total amount" strong>
            {fmt(t.total)}
          </Meta>
        </div>
      </header>

      <section className="mt-[8mm] flex">
        <div className="w-[63mm]">
          <PartyBlock title="Bill From:" party={inv.from} hint={preview ? FROM_HINT : undefined} />
        </div>
        {inv.from.taxId && (
          <div className="text-[#8a8a8a]">
            <p className="mb-[3mm] font-bold">Tax Details:</p>
            <p>Tax ID: {inv.from.taxId}</p>
          </div>
        )}
      </section>

      <ItemsTable inv={inv} fmt={fmt} t={t} preview={preview} />

      {inv.notes.trim() && (
        <section className="mt-[7mm] max-w-[120mm]">
          <p className="mb-[2mm] font-bold">Payment Details:</p>
          <p className="whitespace-pre-line">{inv.notes}</p>
        </section>
      )}

      <footer className="mt-auto flex items-end justify-between pb-[12mm]">
        <div className="flex flex-col gap-[1mm]">
          {inv.from.phone && <Contact label="Contact:">{inv.from.phone}</Contact>}
          {inv.from.email && <Contact label={inv.from.phone ? "" : "Contact:"}>{inv.from.email}</Contact>}
        </div>
        <div className="flex flex-col items-end gap-[6mm]">
          {inv.signature && (inv.from.name || preview) && (
            <p className="text-[20pt] leading-none" style={{ fontFamily: "Lava, Georgia, serif", fontStyle: "italic" }}>
              {inv.from.name || <Hint>Your Name</Hint>}
            </p>
          )}
          <p className="text-[7pt]">PAGE 1 OUT OF 1</p>
        </div>
      </footer>
    </div>
  );
}

function Meta({ label, children, strong }: { label: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <div className={cx("flex justify-between gap-4 py-[0.55mm]", strong && "font-bold")}>
      <span>{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

const Hint = ({ children }: { children: React.ReactNode }) => <span className="text-[#b5b5b5]">{children}</span>;

const FROM_HINT = { name: "Your Name", address: "Street Address\nCity\nPostal Code\nCountry" };
const TO_HINT = { name: "Client Company", address: "Street Address\nCity\nPostal Code\nCountry" };

function PartyBlock({ title, party, detailed, hint }: { title: string; party: Party; detailed?: boolean; hint?: typeof FROM_HINT }) {
  return (
    <div>
      <p className="mb-[3mm] font-bold">{title}</p>
      <p className="whitespace-pre-line">
        {party.name || (hint && <Hint>{hint.name}</Hint>)}
        {"\n"}
        {party.address || (hint && <Hint>{hint.address}</Hint>)}
      </p>
      {detailed && party.email && <p>{party.email}</p>}
      {detailed && party.taxId && <p>Tax ID: {party.taxId}</p>}
    </div>
  );
}

function Contact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="flex gap-[4mm] text-[7.5pt]">
      <span className="w-[12mm] font-bold">{label}</span>
      {children}
    </p>
  );
}

const cell = "border border-[#5a5a5a] px-[3.5mm]";

function ItemsTable({ inv, fmt, t, preview }: { inv: Invoice; fmt: (n: number) => string; t: ReturnType<typeof totals>; preview?: boolean }) {
  const summary: Array<[string, number, boolean?]> = [];
  if (inv.discount) summary.push([`Discount (${plain(inv.discount, inv.locale)}%)`, -t.discount]);
  if (inv.taxLabel.trim()) summary.push([inv.taxRate ? `${inv.taxLabel} (${plain(inv.taxRate, inv.locale)}%)` : inv.taxLabel, t.tax]);
  summary.push(["Total Due", t.total, true]);

  return (
    <table className="mt-[11mm] w-full border-collapse text-[7.5pt]">
      <colgroup>
        <col />
        <col className="w-[25mm]" />
        <col className="w-[27mm]" />
        <col className="w-[36mm]" />
      </colgroup>
      <thead>
        <tr className="h-[8mm] bg-[#d9d9d9] font-bold">
          <th className={cx(cell, "text-left")}>DESCRIPTION</th>
          <th className={cx(cell, "text-center")}>QTY (UNIT)</th>
          <th className={cx(cell, "text-right")}>RATE</th>
          <th className={cx(cell, "text-right")}>TOTAL</th>
        </tr>
      </thead>
      <tbody>
        {inv.items.map((i) => (
          <tr key={i.id} className="h-[8mm]">
            <td className={cx(cell, "py-[2mm] font-bold")}>{i.description || (preview && <Hint>Description of services</Hint>)}</td>
            <td className={cx(cell, "text-center whitespace-nowrap")}>
              {plain(i.qty, inv.locale)}
              {i.unit && ` (${i.unit})`}
            </td>
            <td className={cx(cell, "text-right whitespace-nowrap")}>{fmt(i.rate)}</td>
            <td className={cx(cell, "text-right whitespace-nowrap")}>{fmt(i.qty * i.rate)}</td>
          </tr>
        ))}
        {summary.map(([label, value, strong]) => (
          <tr key={label} className="h-[12mm]">
            <td colSpan={2} className={cell} />
            <td className={cx(cell, "text-right")}>{label}</td>
            <td className={cx(cell, "text-right whitespace-nowrap", strong && "font-bold")}>{fmt(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
