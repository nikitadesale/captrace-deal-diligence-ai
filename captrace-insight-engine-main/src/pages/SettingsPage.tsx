import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-page font-semibold text-foreground">Settings</h1>
      <p className="mt-1 text-body text-muted-foreground">Configure your workspace and integrations.</p>

      <div className="card-surface mt-6 flex flex-col items-center py-16 text-center">
        <SettingsIcon className="mb-4 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Settings will be available in a future update.</p>
      </div>
    </div>
  );
}
