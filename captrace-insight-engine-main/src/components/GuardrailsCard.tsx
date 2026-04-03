import { CheckCircle2, Circle } from "lucide-react";

interface GuardrailItem {
  label: string;
  done: boolean;
}

interface GuardrailsCardProps {
  items: GuardrailItem[];
}

export default function GuardrailsCard({ items }: GuardrailsCardProps) {
  return (
    <div className="card-surface-flat">
      <h3 className="px-5 pt-4 pb-2 text-sm font-semibold text-foreground">Guardrails</h3>
      <ul className="px-5 pb-4 space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5 text-sm">
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
            )}
            <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
