const steps = [
  "Extracting deck",
  "Reading model",
  "Agent analysis",
  "Packaging",
];

interface LoadingStepsProps {
  currentStep: number; // 0-based
}

export default function LoadingSteps({ currentStep }: LoadingStepsProps) {
  return (
    <div className="card-surface p-6">
      {/* Progress bar */}
      <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="flex items-center gap-6">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2 text-sm">
            {i < currentStep ? (
              <span className="h-2 w-2 rounded-full bg-success" />
            ) : i === currentStep ? (
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            )}
            <span className={i <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
