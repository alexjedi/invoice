import { Dialog } from "@base-ui/react/dialog";
import { BotIcon, CheckIcon, ClipboardIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button, popupClass } from "./controls";

export function AgentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [copied, setCopied] = useState(false);
  const site = location.origin;
  const prompt = `Fill an invoice for me at ${site} — how to do it: ${site}/llms.txt\n\nMy details: …\nClient: …\nWork: …`;

  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className={popupClass(
            "fixed top-1/2 left-1/2 z-50 flex w-[min(400px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 p-4",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <Dialog.Title className="flex items-center gap-2 text-[14px]">
              <BotIcon size={14} /> Fill with an AI agent
            </Dialog.Title>
            <Dialog.Close className="-mt-1 -mr-1 flex size-7 cursor-pointer items-center justify-center rounded-lg text-tx-3 hover:bg-field-2 hover:text-tx">
              <XIcon size={14} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-tx-2">
            Paste this into ChatGPT, Claude or any agent with your details. It sends back a link with the invoice filled in. Open it, check, Save PDF.
          </Dialog.Description>
          <pre className="tabular rounded-lg bg-field p-3 whitespace-pre-wrap text-tx select-text">{prompt}</pre>
          <Button variant="solid" onClick={copy}>
            {copied ? <CheckIcon size={14} /> : <ClipboardIcon size={14} />}
            {copied ? "Copied" : "Copy prompt"}
          </Button>
          <p className="text-xs text-tx-3">
            Nothing is saved — not on a server, not in your browser. The link is the invoice.{" "}
            <a href="/llms.txt" target="_blank" className="underline decoration-tx-4 underline-offset-2 hover:text-tx-2">
              Format reference
            </a>
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
