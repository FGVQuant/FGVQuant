import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TeamRowData = {
  name: string;
  result: string;
  members?: string[];
  /** list position (best-placed first) — used only for emphasis, never displayed as a placement */
  rank: number;
  membersLabel: string;
};

/** One results row: node dot + team name + optional members + result chip (the actual placement). */
export function TeamRow({ name, result, members, rank, membersLabel }: TeamRowData) {
  const top = rank === 1;
  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5 sm:p-6",
        top ? "border-highlight/50" : "border-border",
      )}
    >
      <span
        aria-hidden
        className={cn("size-2 rounded-full", top ? "bg-highlight" : "bg-border-strong")}
      />
      <div className="min-w-0 flex-1">
        <h3 className="font-sans text-xl font-semibold tracking-tight">{name}</h3>
        {members && members.length > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {membersLabel}: {members.join(", ")}
          </p>
        ) : null}
      </div>
      <Badge variant={top ? "highlight" : "outline"} className="text-xs">
        {result}
      </Badge>
    </li>
  );
}
