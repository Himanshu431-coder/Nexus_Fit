import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Dumbbell,
  Bot,
  ScanLine,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/", ai: false },
  { label: "Workouts", icon: Dumbbell, path: "/workouts", ai: false },
  { label: "AI Coach", icon: Bot, path: "/coach", ai: true },
  { label: "Form Analyzer", icon: ScanLine, path: "/form-analyzer", ai: true },
  { label: "Insights", icon: BarChart3, path: "/insights", ai: true },
  { label: "Settings", icon: Settings, path: "/settings", ai: false },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: Props) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-nexus-border bg-nexus-bg transition-transform duration-300 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span>⚡</span>
            <span>
              <span className="text-nexus-text-primary">NEXUS</span>{" "}
              <span className="text-nexus-cyan">FIT</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-nexus-text-secondary hover:text-nexus-text-primary">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-l-2 border-nexus-cyan bg-nexus-cyan/10 text-nexus-cyan"
                    : "text-nexus-text-secondary hover:text-nexus-text-primary hover:bg-nexus-surface"
                )}
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.ai && (
                  <span className="rounded bg-nexus-purple/20 px-1.5 py-0.5 text-[10px] font-semibold text-nexus-purple">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-nexus-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-nexus-cyan to-nexus-purple" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-nexus-text-primary truncate">Himanshu</p>
              <span className="inline-block rounded bg-nexus-cyan/15 px-1.5 py-0.5 text-[10px] font-semibold text-nexus-cyan">
                Pro Plan
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
