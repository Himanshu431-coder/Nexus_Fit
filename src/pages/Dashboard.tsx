import { useState, useEffect } from "react";
import { MotionCard } from "@/components/MotionCard";
import { ShieldCheck, Sparkles, Flame, Trophy, Heart, CheckCircle2, Loader2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";

interface PredictionRow {
  calories_burned: number;
  lower_bound: number;
  upper_bound: number;
  confidence_level: number;
  efficiency_rating: string;
  created_at: string;
  workouts: {
    duration: number;
    heart_rate: number;
  }[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [totalCalories, setTotalCalories] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [calorieTrend, setCalorieTrend] = useState<{ day: string; kcal: number }[]>([]);
  const [latestConfidence, setLatestConfidence] = useState(0);
  const [latestBounds, setLatestBounds] = useState({ lower: 0, upper: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("predictions")
      .select("calories_burned, lower_bound, upper_bound, confidence_level, efficiency_rating, created_at, workouts(duration, heart_rate)")
      .order("created_at", { ascending: false })
      .limit(30);

    if (data && data.length > 0) {
      const rows = data as unknown as PredictionRow[];

      // Total calories
      const total = rows.reduce((sum, r) => sum + r.calories_burned, 0);
      setTotalCalories(Math.round(total));

      // Workout count
      setWorkoutCount(rows.length);

      // Average confidence
      const avgConf = rows.reduce((sum, r) => sum + r.confidence_level, 0) / rows.length;
      setAvgConfidence(Math.round(avgConf * 100));

      // Latest prediction bounds
      setLatestConfidence(Math.round(rows[0].confidence_level * 100));
      setLatestBounds({ lower: rows[0].lower_bound, upper: rows[0].upper_bound });

      // Calorie trend (last 7 unique days)
      const dayMap = new Map<string, number>();
      rows.forEach((r) => {
        const date = new Date(r.created_at);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        dayMap.set(dayName, r.calories_burned);
      });

      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const trend = weekDays.map((day) => ({
        day,
        kcal: dayMap.get(day) || 0,
      }));
      setCalorieTrend(trend);
    } else {
      // No data yet — show empty state
      setCalorieTrend([
        { day: "Mon", kcal: 0 }, { day: "Tue", kcal: 0 }, { day: "Wed", kcal: 0 },
        { day: "Thu", kcal: 0 }, { day: "Fri", kcal: 0 }, { day: "Sat", kcal: 0 },
        { day: "Sun", kcal: 0 },
      ]);
    }

    setLoading(false);
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const todayCal = calorieTrend.find((d) => {
    const todayShort = new Date().toLocaleDateString("en-US", { weekday: "short" });
    return d.day === todayShort;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-nexus-cyan" />
      </div>
    );
  }

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
            <span className="text-xs">Total Calories</span>
          </div>
          <div className="mt-3">
            <span className="font-mono text-4xl font-bold text-nexus-cyan">{totalCalories}</span>
            <span className="ml-1 text-sm text-nexus-text-secondary">kcal</span>
          </div>
          {latestBounds.lower > 0 && (
            <p className="mt-1 text-xs text-nexus-green">±{Math.round((latestBounds.upper - latestBounds.lower) / 2)} kcal ({latestConfidence}% confidence)</p>
          )}
        </MotionCard>

        <MotionCard index={1}>
          <div className="flex items-center gap-2 text-nexus-text-secondary">
            <Trophy size={16} className="text-nexus-green" />
            <span className="text-xs">Workouts Logged</span>
          </div>
          <div className="mt-3">
            <span className="font-mono text-3xl font-bold text-nexus-green">{workoutCount}</span>
            <span className="ml-1 text-sm text-nexus-text-secondary">sessions</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-nexus-bg">
            <div
              className="h-full rounded-full bg-nexus-green"
              style={{ width: `${Math.min((workoutCount / 7) * 100, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-nexus-text-secondary">{Math.max(7 - workoutCount, 0)} days to weekly goal</p>
        </MotionCard>

        <MotionCard index={2}>
          <div className="flex items-center gap-2 text-nexus-text-secondary">
            <Heart size={16} className="text-nexus-purple" />
            <span className="text-xs">Avg Confidence</span>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="relative h-16 w-16">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#27272a" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#8b5cf6" strokeWidth="3"
                  strokeDasharray={`${avgConfidence} ${100 - avgConfidence}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-nexus-purple">
                {avgConfidence}
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
            <AreaChart data={calorieTrend}>
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
          <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary">Today's Snapshot</h3>
          <div className="flex flex-col items-center justify-center h-[220px] space-y-4">
            {todayCal && todayCal.kcal > 0 ? (
              <>
                <div className="text-center">
                  <p className="font-mono text-5xl font-bold text-nexus-cyan">{todayCal.kcal}</p>
                  <p className="text-sm text-nexus-text-secondary mt-1">calories burned today</p>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="font-mono text-lg font-bold text-nexus-green">{latestConfidence}%</p>
                    <p className="text-xs text-nexus-text-secondary">confidence</p>
                  </div>
                  <div className="w-px bg-nexus-border" />
                  <div>
                    <p className="font-mono text-lg font-bold text-nexus-purple">{workoutCount}</p>
                    <p className="text-xs text-nexus-text-secondary">total workouts</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-bold text-nexus-text-secondary">No workout today</p>
                <p className="text-sm text-nexus-text-secondary mt-2">Go to Workouts → Log Workout to get started!</p>
              </div>
            )}
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
                {workoutCount > 0
                  ? `You've logged ${workoutCount} workout${workoutCount > 1 ? "s" : ""} with an average confidence of ${avgConfidence}%. ${avgConfidence >= 90 ? "Your predictions are highly accurate — keep it up!" : "Try logging more workouts to improve prediction accuracy."}`
                  : "Start logging workouts to receive personalized AI insights about your training patterns and calorie efficiency."
                }
              </p>
            </div>
          </div>
        </MotionCard>

        <MotionCard index={7}>
          <h3 className="mb-4 text-sm font-semibold text-nexus-text-primary">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-nexus-bg p-3 text-center">
              <p className="font-mono text-2xl font-bold text-nexus-cyan">{totalCalories}</p>
              <p className="text-xs text-nexus-text-secondary">Total kcal</p>
            </div>
            <div className="rounded-lg bg-nexus-bg p-3 text-center">
              <p className="font-mono text-2xl font-bold text-nexus-green">{workoutCount}</p>
              <p className="text-xs text-nexus-text-secondary">Workouts</p>
            </div>
            <div className="rounded-lg bg-nexus-bg p-3 text-center">
              <p className="font-mono text-2xl font-bold text-nexus-purple">{avgConfidence}%</p>
              <p className="text-xs text-nexus-text-secondary">Avg Confidence</p>
            </div>
            <div className="rounded-lg bg-nexus-bg p-3 text-center">
              <p className="font-mono text-2xl font-bold text-nexus-amber">
                {workoutCount > 0 ? Math.round(totalCalories / workoutCount) : 0}
              </p>
              <p className="text-xs text-nexus-text-secondary">Avg kcal/session</p>
            </div>
          </div>
        </MotionCard>
      </div>
    </div>
  );
}