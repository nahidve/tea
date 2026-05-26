import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  value: number | string;
  label: string;
}

export default function StatCard({ value, label, className, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-2.5 rounded-md bg-secondary/40 border border-border/50 hover:border-border transition-all duration-150 cursor-default",
        className
      )}
      {...props}
    >
      <span className="text-base font-bold tracking-tight text-foreground">{value}</span>
      <span className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">{label}</span>
    </div>
  );
}
