import { GitBranch } from "lucide-react";

export default function Pipeline() {
  return (
    <div>
      <h1 className="text-page font-semibold text-foreground">Pipeline</h1>
      <p className="mt-1 text-body text-muted-foreground">Track all diligence runs across your deal flow.</p>

      <div className="card-surface mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-meta font-medium text-muted-foreground">
              <th className="px-5 py-3">Deal</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Score</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                <GitBranch className="mx-auto mb-3 h-6 w-6 text-muted-foreground/50" />
                No runs yet. Start a new diligence run to populate the pipeline.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
