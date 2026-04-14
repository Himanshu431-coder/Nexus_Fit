import { MotionCard } from "@/components/MotionCard";
import { Brain, TrendingUp, Target, Zap, BarChart3 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar,
} from "recharts";

const monthlyData = [
  { month: "Jan", calories: 12400, workouts: 18, avgHR: 142 },
  { month: "Feb", calories: 13200, workouts: 20, avgHR: 140 },
  { month: "Mar", calories: 14800, workouts: 22, avgHR: 138 },
  { month: "Apr", calories: 13900, workouts: 19, avgHR: 141 },
  { month: "May", calories: 15600, workouts: 24, avgHR: 136 },
  { month: "Jun", calories: 16200, workouts: 25, avgHR: 134 },
];

const muscleData = [
  { muscle: "Chest", score: 85 },
  { muscle: "Back", score: 78 },
  { muscle: "Legs", score: 92 },
  { muscle: "Shoulders", score: 70 },
  { muscle: "Arms", score: 88 },
  { muscle: "Core", score: 75 },
];

const weeklyComparison = [
  { week: "W1", thisMonth: 3800, lastMonth: 3200 },
  { week: "W2", thisMonth: 4100, lastMonth: 3500 },
  { week: "W3", thisMonth: 3900, lastMonth: 3700 },
  { week: "W4", thisMonth: 4300, lastMonth: 3400 },
];

const insights = [
  { icon: TrendingUp, color: "text-nexus-green", title: "Cardio Efficiency", text: "Your VO2 max estimate improved by 8% over the last 6 weeks. Keep incorporating interval training." },
  { icon: Target, color: "text-nexus-cyan", title: "Goal Progress", text: "You're 78% toward your monthly calorie burn target of 16,000 kcal." },
  { icon: Zap, color: "text-nexus-amber", title: "Recovery Alert", text: "Your average rest between sets has decreased 15%. Consider longer rest for strength days." },
];

export default function Insights() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-nexus-text-primary">Insights</h1>
        <span className="rounded bg-nexus-purple/20 px-2 py-0.5 text-xs font-semibold text-nexus-purple">AI</span>
      </div>

      {/* AI Insights */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((item, i) => (
          <MotionCard key={item.title} index={i} className="border border-nexus-border bg-nexus-surface rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <item.icon size={18} className={item.color} />
              <h3 className="text-sm font-semibold text-nexus-text-primary">{item.title}</h3>
            </div>
            <p className="text-xs text-nexus-text-secondary leading-relaxed">{item.text}</p>
          </MotionCard>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Calorie Trend */}
        <MotionCard index={3} className="border border-nexus-border bg-nexus-surface rounded-xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary flex items-center gap-2">
            <BarChart3 size={16} className="text-nexus-cyan" /> Monthly Calorie Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="cyanGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "#141419", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa" }} />
              <Area type="monotone" dataKey="calories" stroke="#06b6d4" fill="url(#cyanGrad2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </MotionCard>

        {/* Muscle Group Radar */}
        <MotionCard index={4} className="border border-nexus-border bg-nexus-surface rounded-xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary flex items-center gap-2">
            <Brain size={16} className="text-nexus-purple" /> Muscle Group Balance
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={muscleData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis dataKey="muscle" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </MotionCard>
      </div>

      {/* Weekly Comparison */}
      <MotionCard index={5} className="border border-nexus-border bg-nexus-surface rounded-xl p-6">
        <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary">Weekly Comparison — This Month vs Last</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="week" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} />
            <Tooltip contentStyle={{ background: "#141419", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa" }} />
            <Bar dataKey="thisMonth" fill="#06b6d4" radius={[4, 4, 0, 0]} name="This Month" />
            <Bar dataKey="lastMonth" fill="#27272a" radius={[4, 4, 0, 0]} name="Last Month" />
          </BarChart>
        </ResponsiveContainer>
      </MotionCard>
    </div>
  );
}
