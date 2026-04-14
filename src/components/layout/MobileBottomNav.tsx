import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Dumbbell, Bot, ScanLine, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: LayoutDashboard, path: "/", label: "Home" },
  { icon: Dumbbell, path: "/workouts", label: "Workouts" },
  { icon: Bot, path: "/coach", label: "Coach" },
  { icon: ScanLine, path: "/form-analyzer", label: "Form" },
  { icon: Settings, path: "/settings", label: "Settings" },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-nexus-border bg-nexus-bg/90 backdrop-blur-xl lg:hidden">
      {items.map((item) => {
        const active = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
              active ? "text-nexus-cyan" : "text-nexus-text-secondary"
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
