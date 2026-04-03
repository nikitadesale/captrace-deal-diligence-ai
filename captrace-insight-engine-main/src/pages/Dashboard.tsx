import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <LayoutDashboard className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-page font-semibold text-foreground">Welcome to Captrace</h1>
      <p className="mt-2 max-w-md text-body text-muted-foreground">
        Trace every claim from document to decision. Start a new diligence run to analyze your first pitch deck.
      </p>
    </div>
  );
}
