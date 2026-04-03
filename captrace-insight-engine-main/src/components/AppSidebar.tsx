import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Plus, GitBranch, Settings } from "lucide-react";
import capTraceLogo from "@/assets/captrace-logo.png";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/run", label: "New run", icon: Plus },
  { to: "/pipeline", label: "Pipeline", icon: GitBranch },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5">
        <img src={capTraceLogo} alt="Captrace" className="h-8 w-auto" />
      </div>
      <p className="px-5 -mt-2 mb-4 text-meta text-text-secondary">Governed Deal Intelligence</p>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to === "/run" && pathname === "/run");
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-5 py-4">
        <p className="text-[11px] text-muted-foreground">Demo only. Not investment advice.</p>
      </div>
    </aside>
  );
}
