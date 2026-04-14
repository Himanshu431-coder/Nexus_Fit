import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-nexus-bg">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
