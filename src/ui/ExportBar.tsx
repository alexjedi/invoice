import { AnimatePresence, motion } from "motion/react";
import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { invoiceId } from "../state/format";
import { getInvoice, nextInvoice, useInvoice } from "../state/store";

export function savePdf() {
  const title = document.title;
  document.title = invoiceId(getInvoice());
  window.print();
  document.title = title;
}

export function ExportBar() {
  const id = useInvoice(invoiceId);
  const number = useInvoice((s) => s.number);
  const [printed, setPrinted] = useState<number | null>(null);

  useEffect(() => {
    const done = () => setPrinted(getInvoice().number);
    window.addEventListener("afterprint", done);
    return () => window.removeEventListener("afterprint", done);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 px-3 pt-3">
      <button
        onClick={savePdf}
        className="flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-tx px-3 text-bg transition-[opacity,scale] hover:opacity-90 active:scale-[0.98]"
      >
        <ArrowDownIcon size={14} />
        <span className="text-[14px]">Save PDF</span>
        <span className="tabular ml-auto opacity-60">{id}</span>
      </button>
      <AnimatePresence initial={false}>
        {printed === number && (
          <motion.button
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 36, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onClick={() => (nextInvoice(), setPrinted(null))}
            className="flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-field px-3 text-tx-2 transition-colors hover:bg-field-2 hover:text-tx"
          >
            Start next invoice
            <span className="tabular ml-auto">#{number + 1}</span>
            <ArrowRightIcon size={14} />
          </motion.button>
        )}
      </AnimatePresence>
      <p className="px-1 text-xs text-tx-3">In the print dialog, pick “Save as PDF”.</p>
    </div>
  );
}
