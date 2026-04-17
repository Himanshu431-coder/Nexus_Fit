import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Zap, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/", { replace: true });
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccess("Account created! You can now log in.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-nexus-bg p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-nexus-cyan/10 border border-nexus-cyan/30">
            <Zap size={32} className="text-nexus-cyan" />
          </div>
          <h1 className="text-3xl font-bold text-nexus-text-primary">NEXUS FIT</h1>
          <p className="mt-2 text-sm text-nexus-text-secondary">
            AI Fitness Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-nexus-border bg-nexus-surface p-8 space-y-6">
          <div className="flex rounded-lg bg-nexus-bg p-1">
            <button
              onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                isLogin
                  ? "bg-nexus-cyan text-nexus-bg"
                  : "text-nexus-text-secondary hover:text-nexus-text-primary"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                !isLogin
                  ? "bg-nexus-cyan text-nexus-bg"
                  : "text-nexus-text-secondary hover:text-nexus-text-primary"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-nexus-text-secondary">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-secondary" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  className="bg-nexus-bg border-nexus-border pl-10 text-nexus-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-nexus-text-secondary">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-secondary" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-nexus-bg border-nexus-border pl-10 text-nexus-text-primary"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-nexus-green/30 bg-nexus-green/10 p-3 text-sm text-nexus-green">
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-nexus-cyan text-nexus-bg font-bold hover:bg-nexus-cyan/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isLogin ? (
                "Log In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-nexus-text-secondary">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
            className="text-nexus-cyan hover:underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
}