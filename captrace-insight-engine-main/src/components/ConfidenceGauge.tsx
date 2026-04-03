interface ConfidenceGaugeProps {
  score: number | null; // 0–100
}

export default function ConfidenceGauge({ score }: ConfidenceGaugeProps) {
  const radius = 54;
  const stroke = 8;
  const circumference = Math.PI * radius; // semicircle
  const percent = score !== null ? Math.max(0, Math.min(100, score)) : 0;
  const offset = circumference - (percent / 100) * circumference;

  const color = score === null ? "hsl(var(--muted-foreground))" : percent >= 70 ? "hsl(var(--success))" : percent >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="flex flex-col items-center">
      <svg width="136" height="76" viewBox="0 0 136 76" className="overflow-visible">
        {/* Background arc */}
        <path
          d="M 10 70 A 54 54 0 0 1 126 70"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {score !== null && (
          <path
            d="M 10 70 A 54 54 0 0 1 126 70"
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>
      <div className="-mt-10 text-center">
        <span className="text-2xl font-bold text-foreground">
          {score !== null ? score : "—"}
        </span>
        <span className="text-meta text-muted-foreground ml-0.5">/100</span>
      </div>
      <p className="mt-1 text-meta text-muted-foreground">
        {score !== null ? "Confidence score" : "Awaiting scoring"}
      </p>
    </div>
  );
}
