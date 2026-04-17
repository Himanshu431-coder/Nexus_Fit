import { useState } from "react";
import { MotionCard } from "@/components/MotionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Code2, Heart, Github, Linkedin, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    aiInsights: true,
    weeklyReport: false,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-nexus-text-primary">Settings</h1>

      {/* Profile */}
      <MotionCard index={0}>
        <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary">Profile</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-nexus-cyan to-nexus-purple" />
          <Button variant="outline" className="border-nexus-border text-nexus-text-secondary hover:text-nexus-text-primary">
            Change Avatar
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-nexus-text-secondary">Name</label>
            <Input defaultValue="Himanshu" className="bg-nexus-bg border-nexus-border text-nexus-text-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-nexus-text-secondary">Email</label>
            <Input defaultValue="himanshu@email.com" className="bg-nexus-bg border-nexus-border text-nexus-text-primary" />
          </div>
        </div>
        <Button className="mt-4 bg-nexus-cyan text-nexus-bg hover:bg-nexus-cyan/90">Save Changes</Button>
      </MotionCard>

      {/* Connected Accounts */}
      <MotionCard index={1}>
        <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary">Connected Accounts</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-nexus-text-primary">Google Calendar</span>
            <Button variant="outline" className="border-nexus-cyan text-nexus-cyan hover:bg-nexus-cyan/10">Connect</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-nexus-text-primary">Apple Health</span>
            <span className="rounded bg-nexus-amber/15 px-2.5 py-0.5 text-xs font-semibold text-nexus-amber">Coming Soon</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-nexus-text-primary">Garmin</span>
            <span className="rounded bg-nexus-amber/15 px-2.5 py-0.5 text-xs font-semibold text-nexus-amber">Coming Soon</span>
          </div>
        </div>
      </MotionCard>

      {/* Preferences */}
      <MotionCard index={2}>
        <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-nexus-text-secondary">Unit System</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-nexus-cyan font-medium">Metric</span>
              <span className="text-nexus-text-secondary">/ Imperial</span>
            </div>
          </div>
          {([
            ["Workout Reminders", "workoutReminders"],
            ["AI Insights", "aiInsights"],
            ["Weekly Report", "weeklyReport"],
          ] as const).map(([label, key]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-nexus-text-secondary">{label}</span>
              <Switch
                checked={notifications[key as keyof typeof notifications]}
                onCheckedChange={(v) => setNotifications((p) => ({ ...p, [key]: v }))}
              />
            </div>
          ))}
        </div>
      </MotionCard>

      {/* Developer Credit */}
      <MotionCard index={3} className="border-nexus-cyan/20">
        <div className="flex items-center gap-2 mb-4">
          <Code2 size={16} className="text-nexus-cyan" />
          <h3 className="text-sm font-semibold text-nexus-text-primary">Developer</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-nexus-cyan to-nexus-purple text-lg font-bold text-white">
            H
          </div>
          <div>
            <p className="text-sm font-semibold text-nexus-text-primary">Himanshu Tapde</p>
            <p className="text-xs text-nexus-text-secondary mt-0.5">Creator of NEXUS FIT</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <a
            href="https://github.com/Himanshu431-coder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-nexus-border px-3 py-1.5 text-xs text-nexus-text-secondary hover:text-nexus-cyan hover:border-nexus-cyan/50 transition-colors"
          >
            <Github size={12} />
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/himanshutapde"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-nexus-border px-3 py-1.5 text-xs text-nexus-text-secondary hover:text-nexus-cyan hover:border-nexus-cyan/50 transition-colors"
          >
            <Linkedin size={12} />
            LinkedIn
          </a>
        </div>
        <p className="mt-4 flex items-center gap-1 text-xs text-nexus-text-secondary">
          Built with <Heart size={10} className="text-nexus-red" /> using React, FastAPI, XGBoost, RAG & MediaPipe
        </p>
      </MotionCard>

      {/* Logout */}
      <MotionCard index={4}>
        <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary">Session</h3>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="gap-2 border-nexus-border text-nexus-text-secondary hover:text-nexus-red hover:border-nexus-red/50"
        >
          <LogOut size={16} />
          Log Out
        </Button>
      </MotionCard>

      {/* Danger */}
      <MotionCard index={5} className="border-nexus-red/30">
        <h3 className="mb-4 text-sm font-semibold text-nexus-red">Danger Zone</h3>
        <Button variant="outline" className="border-nexus-red text-nexus-red hover:bg-nexus-red/10">
          Delete Account
        </Button>
      </MotionCard>
    </div>
  );
}