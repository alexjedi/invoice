import { Tooltip } from "@base-ui/react/tooltip";
import { BotIcon, RotateCcwIcon, SunMoonIcon, FileDownIcon, FileUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { invoiceId } from "./state/format";
import { getInvoice, isTouched, replaceInvoice, resetInvoice } from "./state/store";
import { AgentDialog } from "./ui/AgentDialog";
import { IconGithub } from "./ui/icons";
import { IconButton } from "./ui/controls";
import { savePdf } from "./ui/ExportBar";
import { Panel } from "./ui/Panel";
import { Paper } from "./ui/Paper";
import { Stage } from "./ui/Stage";

export function App() {
  useShortcuts();
  return (
    <Tooltip.Provider delay={400}>
      <div id="app" className="flex h-full flex-col gap-2 overflow-y-auto p-2 md:flex-row md:overflow-hidden">
        <main className="flex min-w-0 shrink-0 flex-col gap-3 md:min-h-0 md:flex-1 md:shrink">
          <Toolbar />
          <div className="flex flex-col md:min-h-0 md:flex-1 md:px-6 md:pb-4">
            <Stage />
          </div>
        </main>
        <Panel />
      </div>
      <div id="print">
        <Paper />
      </div>
    </Tooltip.Provider>
  );
}

function Toolbar() {
  const file = useRef<HTMLInputElement>(null);
  const [agent, setAgent] = useState(false);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(getInvoice(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${invoiceId(getInvoice())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (f: File | undefined) => {
    if (!f) return;
    try {
      replaceInvoice(JSON.parse(await f.text()));
    } catch {
      alert("That file isn't valid JSON.");
    }
  };

  return (
    <div className="flex items-center justify-between pt-1 md:justify-center">
      <span className="px-2 text-tx-2 md:hidden">Invoice</span>
      <div className="flex items-center gap-0.5 rounded-xl bg-panel p-1">
        <IconButton tip="Fill with an AI agent" onClick={() => setAgent(true)}>
          <BotIcon size={14} />
        </IconButton>
        <span className="mx-1 h-4 w-px bg-field-2" />
        <IconButton tip="Import setup (.json)" onClick={() => file.current?.click()}>
          <FileUpIcon size={14} />
        </IconButton>
        <IconButton tip="Export setup (.json)" onClick={exportJson}>
          <FileDownIcon size={14} />
        </IconButton>
        <IconButton tip="Start over" onClick={() => confirm("Clear everything and start from a blank invoice?") && resetInvoice()}>
          <RotateCcwIcon size={14} />
        </IconButton>
        <span className="mx-1 h-4 w-px bg-field-2" />
        <IconButton tip="Light / dark" onClick={toggleTheme}>
          <SunMoonIcon size={14} />
        </IconButton>
        <IconButton tip="Source on GitHub" onClick={() => window.open("https://github.com/alexjedi/invoice", "_blank", "noopener")}>
          <IconGithub />
        </IconButton>
      </div>
      <AgentDialog open={agent} onOpenChange={setAgent} />
      <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => (importJson(e.target.files?.[0]), (e.target.value = ""))} />
    </div>
  );
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
}

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "p" || e.key === "s")) {
        e.preventDefault();
        savePdf();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => isTouched() && e.preventDefault();
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, []);
}
