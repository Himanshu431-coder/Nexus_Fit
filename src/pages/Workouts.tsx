import { useState, useEffect } from "react";
import { MotionCard } from "@/components/MotionCard";
import { Plus, Loader2, Zap, Activity, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

const API = import.meta.env.PROD
  ? "https://himanshuml24-nexus-fit-api.hf.space"
  : "http://127.0.0.1:8000";

const ratingColor: Record<string, string> = {
  Excellent: "bg-nexus-green/15 text-nexus-green border-nexus-green/30",
  Good: "bg-nexus-cyan/15 text-nexus-cyan border-nexus-cyan/30",
  Moderate: "bg-nexus-amber/15 text-nexus-amber border-nexus-amber/30",
};

interface PredictionResult {
  prediction: {
    calories_burned: number;
    lower_bound: number;
    upper_bound: number;
    confidence_level: number;
    model_version: string;
    features_used: number;
  };
  shap_top_features: {
    feature: string;
    value: number;
    contribution: number;
    direction: string;
  }[];
  insight: string;
  intensity_zone: string;
  efficiency_rating: string;
}

interface ZoneResult {
  zone: number;
  zone_name: string;
  zone_color: string;
  description: string;
  max_hr: number;
  hr_max_percent: number;
  fat_burn_pct: number;
  carb_burn_pct: number;
  estimated_calories: number;
  cal_per_minute: number;
  duration_recommendation: {
    min: number;
    max: number;
    unit: string;
    tip: string;
  };
  safety: string;
  safety_note: string;
  tips: string[];
  model: string;
}

interface WorkoutRow {
  id: string;
  created_at: string;
  duration: number;
  heart_rate: number;
  predictions: {
    calories_burned: number;
    confidence_level: number;
    efficiency_rating: string;
  }[];
}

export default function Workouts() {
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [zoneResult, setZoneResult] = useState<ZoneResult | null>(null);
  const [error, setError] = useState("");
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);

  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("75");
  const [duration, setDuration] = useState("30");
  const [heartRate, setHeartRate] = useState("150");
  const [bodyTemp, setBodyTemp] = useState("37.5");

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    const { data } = await supabase
      .from("workouts")
      .select("id, created_at, duration, heart_rate, predictions(calories_burned, confidence_level, efficiency_rating)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) setWorkouts(data as unknown as WorkoutRow[]);
  };

  const handlePredict = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setZoneResult(null);

    try {
      const response = await fetch(`${API}/api/v1/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: gender,
          age: parseInt(age),
          height: parseFloat(height),
          weight: parseFloat(weight),
          duration: parseFloat(duration),
          heart_rate: parseFloat(heartRate),
          body_temp: parseFloat(bodyTemp),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Prediction failed");
      }

      const data: PredictionResult = await response.json();
      setResult(data);

      // Also get zone prediction
      try {
        const zoneResponse = await fetch(`${API}/api/v1/predict-zone`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: parseInt(age),
            heart_rate: parseFloat(heartRate),
            duration: parseFloat(duration),
            weight: parseFloat(weight),
          }),
        });
        if (zoneResponse.ok) {
          const zoneData: ZoneResult = await zoneResponse.json();
          setZoneResult(zoneData);
        }
      } catch {
        // Zone prediction optional — don't block main prediction
      }

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          gender,
          age: parseInt(age),
          height: parseFloat(height),
          weight: parseFloat(weight),
          duration: parseFloat(duration),
          heart_rate: parseFloat(heartRate),
          body_temp: parseFloat(bodyTemp),
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      await supabase.from("predictions").insert({
        workout_id: workoutData.id,
        user_id: user.id,
        calories_burned: data.prediction.calories_burned,
        lower_bound: data.prediction.lower_bound,
        upper_bound: data.prediction.upper_bound,
        confidence_level: data.prediction.confidence_level,
        intensity_zone: data.intensity_zone,
        efficiency_rating: data.efficiency_rating,
        model_version: data.prediction.model_version,
        features_used: data.prediction.features_used,
      });

      fetchWorkouts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-CA");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-nexus-text-primary">Workout Log</h1>
        <Button
          onClick={() => {
            setFormOpen(!formOpen);
            setResult(null);
            setZoneResult(null);
            setError("");
          }}
          className="gap-2 bg-nexus-cyan text-nexus-bg hover:bg-nexus-cyan/90 rounded-lg"
        >
          <Plus size={16} />
          Log Workout
        </Button>
      </div>

      {formOpen && (
        <MotionCard index={0} className="space-y-4">
          <h3 className="text-sm font-semibold text-nexus-text-primary">New Workout</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-nexus-text-secondary">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="h-10 w-full rounded-md border border-nexus-border bg-nexus-bg px-3 text-sm text-nexus-text-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-nexus-text-secondary">Age</label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="bg-nexus-bg border-nexus-border text-nexus-text-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-nexus-text-secondary">Height (cm)</label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="bg-nexus-bg border-nexus-border text-nexus-text-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-nexus-text-secondary">Weight (kg)</label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75"
                className="bg-nexus-bg border-nexus-border text-nexus-text-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-nexus-text-secondary">Duration (min)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="bg-nexus-bg border-nexus-border text-nexus-text-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-nexus-text-secondary">Avg Heart Rate (BPM)</label>
              <Input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="145"
                className="bg-nexus-bg border-nexus-border text-nexus-text-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-nexus-text-secondary">Body Temp (°C)</label>
              <Input
                type="number"
                value={bodyTemp}
                onChange={(e) => setBodyTemp(e.target.value)}
                placeholder="37.2"
                className="bg-nexus-bg border-nexus-border text-nexus-text-primary"
              />
            </div>
          </div>
          <Button
            onClick={handlePredict}
            disabled={loading}
            className="bg-nexus-cyan text-nexus-bg font-bold hover:bg-nexus-cyan/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap size={16} />
                Predict with Nexus AI
              </>
            )}
          </Button>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              ⚠️ {error}
            </div>
          )}

          {result && (
            <div className="space-y-4 rounded-lg border border-nexus-cyan/30 bg-nexus-cyan/5 p-6">
              <h3 className="text-lg font-bold text-nexus-cyan flex items-center gap-2">
                <Zap size={20} />
                Nexus AI Prediction
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-nexus-surface p-4 text-center">
                  <p className="text-xs text-nexus-text-secondary mb-1">Calories Burned</p>
                  <p className="text-4xl font-bold font-mono text-nexus-cyan">
                    {result.prediction.calories_burned}
                  </p>
                  <p className="text-xs text-nexus-text-secondary mt-1">kcal</p>
                </div>
                <div className="rounded-lg bg-nexus-surface p-4 text-center">
                  <p className="text-xs text-nexus-text-secondary mb-1">Confidence Interval</p>
                  <p className="text-2xl font-bold font-mono text-nexus-green">
                    {result.prediction.lower_bound} — {result.prediction.upper_bound}
                  </p>
                  <p className="text-xs text-nexus-green mt-1">
                    {(result.prediction.confidence_level * 100).toFixed(0)}% confidence
                  </p>
                </div>
                <div className="rounded-lg bg-nexus-surface p-4 text-center">
                  <p className="text-xs text-nexus-text-secondary mb-1">Efficiency</p>
                  <p className="text-2xl font-bold text-nexus-text-primary">
                    {result.efficiency_rating}
                  </p>
                  <p className="text-xs text-nexus-text-secondary mt-1">
                    {result.intensity_zone}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-nexus-surface p-4">
                <p className="text-xs text-nexus-text-secondary mb-2 flex items-center gap-1">
                  <Activity size={12} /> Feature Contributions
                </p>
                <div className="space-y-2">
                  {result.shap_top_features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-32 text-xs text-nexus-text-secondary">{f.feature}</span>
                      <div className="flex-1 h-2 rounded-full bg-nexus-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-nexus-cyan"
                          style={{ width: `${f.contribution}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-nexus-cyan">{f.contribution}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-nexus-purple/30 bg-nexus-purple/5 p-4">
                <p className="text-xs text-nexus-purple mb-1 flex items-center gap-1">
                  <Shield size={12} /> AI Insight
                </p>
                <p className="text-sm text-nexus-text-secondary">{result.insight}</p>
              </div>

              <p className="text-xs text-nexus-text-secondary text-right">
                Model: {result.prediction.model_version} • {result.prediction.features_used} features • Saved ✓
              </p>
            </div>
          )}

          {zoneResult && (
            <div className="space-y-4 rounded-lg border border-nexus-amber/30 bg-nexus-amber/5 p-6">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: zoneResult.zone_color }}>
                <span className="text-lg">❤️</span>
                Heart Rate Zone: {zoneResult.zone_name} (Zone {zoneResult.zone})
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-nexus-surface p-4 text-center">
                  <p className="text-xs text-nexus-text-secondary mb-1">% of Max HR</p>
                  <p className="text-3xl font-bold font-mono" style={{ color: zoneResult.zone_color }}>
                    {zoneResult.hr_max_percent}%
                  </p>
                  <p className="text-xs text-nexus-text-secondary mt-1">Max HR: {zoneResult.max_hr} bpm</p>
                </div>
                <div className="rounded-lg bg-nexus-surface p-4 text-center">
                  <p className="text-xs text-nexus-text-secondary mb-1">Fat / Carb Burn</p>
                  <p className="text-xl font-bold">
                    <span className="text-nexus-green">{zoneResult.fat_burn_pct}%</span>
                    <span className="text-nexus-text-secondary mx-1">/</span>
                    <span className="text-nexus-amber">{zoneResult.carb_burn_pct}%</span>
                  </p>
                  <p className="text-xs text-nexus-text-secondary mt-1">fuel split</p>
                </div>
                <div className="rounded-lg bg-nexus-surface p-4 text-center">
                  <p className="text-xs text-nexus-text-secondary mb-1">Est. Calories</p>
                  <p className="text-3xl font-bold font-mono text-nexus-cyan">
                    {zoneResult.estimated_calories}
                  </p>
                  <p className="text-xs text-nexus-text-secondary mt-1">{zoneResult.cal_per_minute} kcal/min</p>
                </div>
              </div>

              <div className="rounded-lg bg-nexus-surface p-4">
                <p className="text-xs text-nexus-text-secondary mb-1">{zoneResult.description}</p>
                <p className="text-xs text-nexus-text-secondary mt-2">
                  Recommended: {zoneResult.duration_recommendation.min}–{zoneResult.duration_recommendation.max} {zoneResult.duration_recommendation.unit}
                </p>
              </div>

              <div className="rounded-lg bg-nexus-surface p-4">
                <p className="text-xs font-semibold text-nexus-text-primary mb-2">Training Tips</p>
                <ul className="space-y-1">
                  {zoneResult.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-nexus-text-secondary flex gap-2">
                      <span className="text-nexus-cyan">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <p className={`text-xs font-medium ${zoneResult.safety === "safe" ? "text-nexus-green" : zoneResult.safety === "caution" ? "text-nexus-amber" : "text-red-400"}`}>
                {zoneResult.safety_note}
              </p>

              <p className="text-xs text-nexus-text-secondary text-right">
                {zoneResult.model}
              </p>
            </div>
          )}
        </MotionCard>
      )}

      <MotionCard index={1} className="overflow-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-nexus-border text-left text-xs text-nexus-text-secondary">
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Duration</th>
              <th className="px-6 py-3 font-medium">Avg HR</th>
              <th className="px-6 py-3 font-medium">Calories</th>
              <th className="px-6 py-3 font-medium">Confidence</th>
              <th className="px-6 py-3 font-medium">AI Rating</th>
            </tr>
          </thead>
          <tbody>
            {workouts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-nexus-text-secondary">
                  No workouts yet. Click "Log Workout" to get started.
                </td>
              </tr>
            ) : (
              workouts.map((w) => {
                const pred = w.predictions?.[0];
                return (
                  <tr
                    key={w.id}
                    className="border-b border-nexus-border transition-colors hover:bg-nexus-surface-hover"
                  >
                    <td className="px-6 py-4 font-mono text-nexus-text-secondary">
                      {formatDate(w.created_at)}
                    </td>
                    <td className="px-6 py-4 text-nexus-text-secondary">{w.duration} min</td>
                    <td className="px-6 py-4 font-mono text-nexus-text-primary">{w.heart_rate} bpm</td>
                    <td className="px-6 py-4 font-mono text-nexus-cyan">
                      {pred ? `${pred.calories_burned} kcal` : "—"}
                    </td>
                    <td className="px-6 py-4 font-mono text-nexus-text-secondary">
                      {pred ? `${(pred.confidence_level * 100).toFixed(0)}%` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {pred ? (
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ratingColor[pred.efficiency_rating] || ratingColor["Good"]}`}
                        >
                          {pred.efficiency_rating}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </MotionCard>
    </div>
  );
}