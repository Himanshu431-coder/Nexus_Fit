import { useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cyan-500">404</h1>
        <p className="text-zinc-400 mt-2">Page not found: {location.pathname}</p>
      </div>
    </div>
  );
}