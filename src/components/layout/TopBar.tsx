import { useLocation } from "react-router-dom";
import { Menu, Search, Bell, Settings } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/workouts": "Workouts",
  "/coach": "AI Coach",
  "/form-analyzer": "Form Analyzer",
  "/insights": "Insights",
  "/settings": "Settings",
};

export function TopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <header className="flex h-16 items-center justify-between border-b border-nexus-border px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="text-nexus-text-secondary hover:text-nexus-text-primary lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-nexus-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-nexus-border bg-nexus-surface px-3 py-1.5 text-sm text-nexus-text-secondary md:flex">
          <Search size={14} />
          <span>Search…</span>
          <kbd className="rounded bg-nexus-bg px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
        </div>
        <button className="relative text-nexus-text-secondary hover:text-nexus-text-primary">
          <Bell size={18} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-nexus-green" />
        </button>
        <button className="text-nexus-text-secondary hover:text-nexus-text-primary">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
