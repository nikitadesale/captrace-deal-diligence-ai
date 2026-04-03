import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface RawTraceProps {
  data: unknown;
}

export default function RawTrace({ data }: RawTraceProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card-surface-flat">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors rounded-xl"
      >
        Raw trace
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t px-5 py-4">
          <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-4 text-xs font-mono text-foreground leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
