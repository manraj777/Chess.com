export const Timer = ({ label, seconds, active }: {
  label: string;
  seconds: number;
  active?: boolean;
}) => {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const pct = Math.min(100, Math.max(0, (seconds / (5 * 60)) * 100)); // default 5 min bar
  return (
    <div className={`backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-4 py-2 shadow-lg flex items-center gap-3 ${active ? "ring-2 ring-green-400" : "ring-1 ring-white/10"}`}>
      <div className="text-xs uppercase tracking-widest text-white/80">{label}</div>
      <div className={`text-2xl font-mono ${active ? "text-green-300" : "text-white"}`}>{mm}:{ss}</div>
      <div className="flex-1 h-2 bg-white/10 rounded overflow-hidden">
        <div className="h-full bg-green-500/70" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
