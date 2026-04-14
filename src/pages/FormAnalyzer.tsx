import { useState, useRef, useCallback } from "react";
import { MotionCard } from "@/components/MotionCard";
import { Upload, Play, AlertTriangle, CheckCircle, Loader2, RotateCcw, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AngleResult {
  name: string;
  angle: number;
  status: "good" | "warning" | "danger";
  advice: string;
}

interface FormResult {
  score: number;
  angles: AngleResult[];
  summary: string;
}

function calculateAngle(a: number[], b: number[], c: number[]): number {
  const radians =
    Math.atan2(c[1] - b[1], c[0] - b[0]) -
    Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle);
}

function analyzeForm(landmarks: number[][]): FormResult {
  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];

  const rightShoulder = landmarks[12];
  const rightElbow = landmarks[14];
  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];

  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const leftShoulderAngle = calculateAngle(leftHip, leftShoulder, leftElbow);
  const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);

  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);

  const angles: AngleResult[] = [
    {
      name: "Left Knee Angle",
      angle: leftKneeAngle,
      status: leftKneeAngle >= 160 ? "good" : leftKneeAngle >= 140 ? "warning" : "danger",
      advice:
        leftKneeAngle >= 160
          ? "Great knee extension — legs are straight and stable."
          : leftKneeAngle >= 140
          ? "Slight knee bend detected. If squatting, go deeper. If standing, straighten legs."
          : "Significant knee bend. Ensure proper form — knees should track over toes.",
    },
    {
      name: "Right Knee Angle",
      angle: rightKneeAngle,
      status: rightKneeAngle >= 160 ? "good" : rightKneeAngle >= 140 ? "warning" : "danger",
      advice:
        rightKneeAngle >= 160
          ? "Right leg has good extension."
          : rightKneeAngle >= 140
          ? "Right knee slightly bent. Focus on even weight distribution."
          : "Right knee significantly bent. Check for knee valgus (caving inward).",
    },
    {
      name: "Left Hip Angle",
      angle: leftHipAngle,
      status: leftHipAngle >= 160 ? "good" : leftHipAngle >= 120 ? "warning" : "danger",
      advice:
        leftHipAngle >= 160
          ? "Good hip position — torso is upright."
          : leftHipAngle >= 120
          ? "Moderate hip hinge. Good for deadlifts, adjust if doing squats."
          : "Deep hip flexion. Ensure back is straight and core is braced.",
    },
    {
      name: "Right Hip Angle",
      angle: rightHipAngle,
      status: rightHipAngle >= 160 ? "good" : rightHipAngle >= 120 ? "warning" : "danger",
      advice:
        rightHipAngle >= 160
          ? "Right hip aligned properly."
          : rightHipAngle >= 120
          ? "Right hip showing moderate flexion. Keep core engaged."
          : "Deep right hip flexion. Watch for lower back rounding.",
    },
    {
      name: "Left Elbow Angle",
      angle: leftElbowAngle,
      status: leftElbowAngle >= 140 || leftElbowAngle <= 90 ? "warning" : "good",
      advice:
        leftElbowAngle >= 160
          ? "Arms extended — good for overhead movements."
          : leftElbowAngle >= 90
          ? "Good arm position for most exercises."
          : "Arms very bent. If bench pressing, check grip width.",
    },
    {
      name: "Left Shoulder Angle",
      angle: leftShoulderAngle,
      status: leftShoulderAngle >= 30 && leftShoulderAngle <= 120 ? "good" : "warning",
      advice:
        leftShoulderAngle >= 30 && leftShoulderAngle <= 120
          ? "Shoulder position looks healthy."
          : "Shoulder angle is extreme. Watch for impingement risk.",
    },
  ];

  const goodCount = angles.filter((a) => a.status === "good").length;
  const score = Math.round((goodCount / angles.length) * 100);

  let summary: string;
  if (score >= 80) {
    summary = "Excellent form! Your joint angles show proper alignment. Keep up the great work — maintain this form as intensity increases.";
  } else if (score >= 60) {
    summary = "Good form with minor adjustments needed. Focus on the flagged joints above — small corrections will significantly reduce injury risk.";
  } else if (score >= 40) {
    summary = "Form needs improvement. Several joints are out of optimal range. Consider reducing weight and focusing on technique before progressing.";
  } else {
    summary = "Form requires significant correction. Stop and reset. Consider working with a trainer to establish proper movement patterns before continuing.";
  }

  return { score, angles, summary };
}

export default function FormAnalyzer() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setResult(null);
    setProgress(0);

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  }, []);

  const analyzeVideo = useCallback(async () => {
    if (!videoUrl || !videoRef.current) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    setProgress(0);

    try {
      const video = videoRef.current;

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        video.onloadeddata = () => resolve();
        video.load();
      });

      const w = video.videoWidth;
      const h = video.videoHeight;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Pose = (window as any).Pose;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const drawConnectors = (window as any).drawConnectors;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const drawLandmarks = (window as any).drawLandmarks;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const POSE_CONNECTIONS_MP = (window as any).POSE_CONNECTIONS;

      if (!Pose) {
        throw new Error("MediaPipe not loaded. Refresh the page and try again.");
      }

      const pose = new Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      let bestScore = 0;
      let bestResult: FormResult | null = null;
      let framesAnalyzed = 0;
      const totalFrames = Math.min(Math.floor(video.duration * 5), 30); // 5 fps, max 30 frames

      pose.onResults((results: any) => {
        framesAnalyzed++;
        setProgress(Math.round((framesAnalyzed / totalFrames) * 100));

        if (!results.poseLandmarks || results.poseLandmarks.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, w, h);

        if (drawConnectors && POSE_CONNECTIONS_MP) {
          drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS_MP, {
            color: "#06b6d4",
            lineWidth: 3,
          });
        }
        if (drawLandmarks) {
          drawLandmarks(ctx, results.poseLandmarks, {
            color: "#8b5cf6",
            lineWidth: 1,
            radius: 5,
          });
        }

        const landmarks = results.poseLandmarks.map((lm: any) => [
          lm.x * w,
          lm.y * h,
          lm.z || 0,
        ]);

        const formResult = analyzeForm(landmarks);
        if (formResult.score > bestScore) {
          bestScore = formResult.score;
          bestResult = formResult;
        }
      });

      // Seek through video at intervals
      const duration = video.duration;
      const step = duration / totalFrames;

      for (let i = 0; i < totalFrames; i++) {
        video.currentTime = i * step;
        await new Promise<void>((resolve) => {
          video.onseeked = () => resolve();
        });
        await pose.send({ image: video });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (bestResult) {
        setResult(bestResult);
      } else {
        setError("No pose detected in any frame. Try a video with clear full-body visibility.");
      }

      setAnalyzing(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      setAnalyzing(false);
    }
  }, [videoUrl]);

  const reset = () => {
    setVideoUrl(null);
    setResult(null);
    setError("");
    setProgress(0);
  };

  const scoreColor = result
    ? result.score >= 80
      ? "text-nexus-green"
      : result.score >= 60
      ? "text-nexus-cyan"
      : result.score >= 40
      ? "text-nexus-amber"
      : "text-red-400"
    : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-nexus-text-primary">Form Analyzer</h1>
        <span className="rounded bg-nexus-purple/20 px-2 py-0.5 text-xs font-semibold text-nexus-purple">
          MediaPipe
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload & Video */}
        <MotionCard index={0} className="space-y-4">
          {!videoUrl ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-nexus-border bg-nexus-bg p-12 transition-colors hover:border-nexus-cyan/50 hover:bg-nexus-cyan/5">
              <Video size={40} className="mb-3 text-nexus-text-secondary" />
              <p className="text-sm font-medium text-nexus-text-primary">
                Upload Exercise Video
              </p>
              <p className="mt-1 text-xs text-nexus-text-secondary">
                MP4, MOV, WebM • Full body visibility
              </p>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl bg-nexus-bg">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full rounded-xl"
                  muted
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full rounded-xl"
                  style={{ display: result ? "block" : "none" }}
                />
              </div>

              {analyzing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-nexus-text-secondary">Analyzing frames...</span>
                    <span className="font-mono text-nexus-cyan">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-nexus-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-nexus-cyan transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={analyzeVideo}
                  disabled={analyzing}
                  className="flex-1 bg-nexus-cyan text-nexus-bg font-bold hover:bg-nexus-cyan/90 disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing... {progress}%
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Analyze Form
                    </>
                  )}
                </Button>
                <Button
                  onClick={reset}
                  variant="outline"
                  className="border-nexus-border text-nexus-text-secondary hover:text-nexus-text-primary"
                >
                  <RotateCcw size={16} />
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertTriangle size={16} className="inline mr-2" />
              {error}
            </div>
          )}
        </MotionCard>

        {/* Results */}
        <MotionCard index={1} className="space-y-4">
          {!result ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Video size={48} className="mb-4 text-nexus-text-secondary opacity-30" />
              <p className="text-sm text-nexus-text-secondary">
                Upload a video and click "Analyze Form" to see your results
              </p>
              <p className="mt-2 text-xs text-nexus-text-secondary">
                Detects 33 body landmarks • Analyzes multiple frames • Scores your best form
              </p>
            </div>
          ) : (
            <>
              {/* Score */}
              <div className="text-center rounded-xl bg-nexus-bg p-6">
                <p className="text-xs text-nexus-text-secondary mb-2">Form Score</p>
                <p className={`text-6xl font-bold font-mono ${scoreColor}`}>
                  {result.score}
                </p>
                <p className="text-sm text-nexus-text-secondary mt-1">/ 100</p>
                <div className="mt-3 h-2 rounded-full bg-nexus-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      result.score >= 80
                        ? "bg-nexus-green"
                        : result.score >= 60
                        ? "bg-nexus-cyan"
                        : result.score >= 40
                        ? "bg-nexus-amber"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {/* Angles */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-nexus-text-primary">Joint Analysis</h3>
                {result.angles.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-nexus-bg p-3"
                  >
                    {a.status === "good" ? (
                      <CheckCircle size={16} className="text-nexus-green shrink-0" />
                    ) : (
                      <AlertTriangle
                        size={16}
                        className={a.status === "warning" ? "text-nexus-amber shrink-0" : "text-red-400 shrink-0"}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-nexus-text-primary">
                          {a.name}
                        </span>
                        <span className="text-xs font-mono text-nexus-cyan">{a.angle}°</span>
                      </div>
                      <p className="text-xs text-nexus-text-secondary mt-0.5 truncate">
                        {a.advice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-nexus-purple/30 bg-nexus-purple/5 p-4">
                <p className="text-xs text-nexus-purple mb-1 font-semibold">AI Summary</p>
                <p className="text-sm text-nexus-text-secondary">{result.summary}</p>
              </div>
            </>
          )}
        </MotionCard>
      </div>
    </div>
  );
}