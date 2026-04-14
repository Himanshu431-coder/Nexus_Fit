import { MotionCard } from "@/components/MotionCard";
import { ShieldCheck, Sparkles, Flame, Trophy, Heart, CheckCircle2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";

const calorieData = [
  { day: "Mon", kcal: 320 },
  { day: "Tue", kcal: 410 },
  { day: "Wed", kcal: 385 },
  { day: "Thu", kcal: 487 },
  { day: "Fri", kcal: 445 },
  { day: "Sat", kcal: 390 },
  { day: "Sun", kcal: 487 },
];

const hrZones = [
  { zone: "Zone 1", min: 8, color: "#60a5fa" },
  { zone: "Zone 2", min: 12, color: "#22d3ee" },
  { zone: "Zone 3", min: 15, color: "#22c55e" },
  { zone: "Zone 4", min: 10, color: "#f59e0b" },
  { zone: "Zone 5", min: 5, color: "#ef4444" },
];

const weekPlan = [
  { day: "Mon", type: "HIIT", done: true },
  { day: "Tue", type: "Run", done: true },
  { day: "Wed", type: "Yoga", done: true },
  { day: "Thu", type: "Weights", done: true },
  { day: "Fri", type: "Cycling", done: true },
  { day: "Sat", type: "HIIT", done: false },
  { day: "Sun", type: "Rest", done: false },
];

export default function Dashboard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-nexus-text-primary">Welcome to NEXUS FIT</h1>
        <p className="text-sm text-nexus-text-secondary">{today}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MotionCard index={0} className="glow-cyan">
          <div className="flex items-center gap-2 text-nexus-text-secondary">
            <Flame size={16} className="text-nexus-cyan" />
            <span className="text-xs">Today's Burn</span>
          </div>
          <div className="mt-3">
            <span className="font-mono text-4xl font-bold text-nexus-cyan">487</span>
            <span className="ml-1 text-sm text-nexus-text-secondary">kcal</span>
          </div>
          <p className="mt-1 text-xs text-nexus-green">±23 kcal (94% confidence)</p>
        </MotionCard>

        <MotionCard index={1}>
          <div className="flex items-center gap-2 text-nexus-text-secondary">
            <Trophy size={16} className="text-nexus-green" />
            <span className="text-xs">Weekly Streak</span>
          </div>
          <div className="mt-3">
            <span className="font-mono text-3xl font-bold text-nexus-green">5/7</span>
            <span className="ml-1 text-sm text-nexus-text-secondary">days</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-nexus-bg">
            <div className="h-full rounded-full bg-nexus-green" style={{ width: "71%" }} />
          </div>
          <p className="mt-1 text-xs text-nexus-text-secondary">2 days remaining</p>
        </MotionCard>

        <MotionCard index={2}>
          <div className="flex items-center gap-2 text-nexus-text-secondary">
            <Heart size={16} className="text-nexus-purple" />
            <span className="text-xs">Recovery Score</span>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="relative h-16 w-16">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#27272a" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#8b5cf6" strokeWidth="3"
                  strokeDasharray={`${82} ${100 - 82}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-nexus-purple">
                82
              </span>
            </div>
            <span className="text-sm text-nexus-text-secondary">/100</span>
          </div>
        </MotionCard>

        <MotionCard index={3}>
          <div className="flex items-center gap-2 text-nexus-text-secondary">
            <ShieldCheck size={16} className="text-nexus-green" />
            <span className="text-xs">Injury Risk</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-nexus-green">Low</span>
          </div>
          <p className="mt-1 text-xs text-nexus-text-secondary">12% risk score</p>
        </MotionCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MotionCard index={4}>
          <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary">7-Day Calorie Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={calorieData}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#141419", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa" }}
              />
              <Area type="monotone" dataKey="kcal" stroke="#06b6d4" fill="url(#cyanGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </MotionCard>

        <MotionCard index={5}>
          <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary">Heart Rate Zones</h3>
          <div className="space-y-3">
            {hrZones.map((z) => (
              <div key={z.zone} className="flex items-center gap-3">
                <span className="w-14 text-xs text-nexus-text-secondary">{z.zone}</span>
                <div className="flex-1 h-5 overflow-hidden rounded bg-nexus-bg">
                  <div
                    className="h-full rounded transition-all"
                    style={{ width: `${(z.min / 50) * 100}%`, backgroundColor: z.color }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-xs text-nexus-text-secondary">{z.min} min</span>
              </div>
            ))}
          </div>
        </MotionCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MotionCard index={6} className="border-l-4 border-l-nexus-purple">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="mt-0.5 shrink-0 text-nexus-purple" />
            <div>
              <h3 className="text-sm font-semibold text-nexus-text-primary">AI Insight of the Day</h3>
              <p className="mt-2 text-sm leading-relaxed text-nexus-text-secondary">
                Your calorie burn efficiency improved 12% this month. You're adapting well to HIIT.
                Consider increasing duration by 5 min next week.
              </p>
            </div>
          </div>
        </MotionCard>

        <MotionCard index={7}>
          <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary">Weekly Plan</h3>
          <div className="grid grid-cols-7 gap-2">
            {weekPlan.map((d) => (
              <div
                key={d.day}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 ${d.done ? "opacity-100" : "opacity-40"}`}
              >
                <span className="text-[10px] text-nexus-text-secondary">{d.day}</span>
                <span className="text-xs font-medium text-nexus-text-primary">{d.type}</span>
                {d.done && <CheckCircle2 size={14} className="text-nexus-green" />}
              </div>
            ))}
          </div>
        </MotionCard>
      </div>
    </div>
  );
}
