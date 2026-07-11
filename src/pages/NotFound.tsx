import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard className="flex max-w-md flex-col items-center gap-4 p-10 text-center">
        <span className="text-sm font-medium tracking-wide text-ink-400">404</span>
        <h1 className="text-2xl font-semibold text-white">This page isn't on shift</h1>
        <p className="text-sm text-ink-300">
          The page you're looking for doesn't exist, or your workforce hasn't built it yet.
        </p>
        <Link to="/">
          <Button>Back to Dashboard</Button>
        </Link>
      </GlassCard>
    </div>
  );
}
