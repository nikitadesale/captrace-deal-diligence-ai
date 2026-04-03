interface RunMetadataCardProps {
  runId: string;
  timestamp: string;
  duration?: string;
}

export default function RunMetadataCard({ runId, timestamp, duration }: RunMetadataCardProps) {
  return (
    <div className="card-surface-flat">
      <h3 className="px-5 pt-4 pb-2 text-sm font-semibold text-foreground">Run metadata</h3>
      <dl className="px-5 pb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Run ID</dt>
          <dd className="font-mono text-meta text-foreground">{runId}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Timestamp</dt>
          <dd className="text-foreground">{timestamp}</dd>
        </div>
        {duration && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Duration</dt>
            <dd className="text-foreground">{duration}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
